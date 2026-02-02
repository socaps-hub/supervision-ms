import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Usuario } from "src/common/entities/usuario.entity";
import { SisconcapHistoricoResponseDto, SisconcapHistoricoSucursalDto, SisconcapHistoricoTotalesGlobalesDto, SisconcapHistoricoMesDto } from "../dto/historicos/historico-response.dto";
import { SisconcapHistoricoFiltroInput, MovimientoOptions, SisconcapFaseOptions } from "../dto/historicos/inputs/filtro-historico-reporte.input";
import { normalizeToYYYYMMDD } from "src/common/utils/date.util";

@Injectable()
export class HistoricoService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('Sisconcap -HistoricoService')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    private meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    private obtenerMesNombre(fecha: Date): string {
        return this.meses[fecha.getMonth()];
    }

    /**
   * Genera el reporte histórico SISCONCAP (Fase I, II o III)
   */
    async getReporteHistorico(
        input: SisconcapHistoricoFiltroInput,
        user: Usuario,
    ): Promise<SisconcapHistoricoResponseDto> {
        const { fase, movimiento } = input;
        const fechaInicio = normalizeToYYYYMMDD(input.fechaInicio);
        const fechaFinal  = normalizeToYYYYMMDD(input.fechaFinal);   

        // Filtro base
        const where: any = {
            R19Coop_id: user.R12Coop_id,
            R19FRev: {
                gte: fechaInicio,
                lte: fechaFinal,
            },
        };

        if (movimiento !== MovimientoOptions.TODOS) {
            where.R19TipoMov = movimiento;
        }

        // Incluir relaciones según fase
        // let include: any = { sucursal: true };
        // if (fase === SisconcapFaseOptions.FASE_I) {
        //     include.evaluacionResumenFase1 = true;
        // } else if (fase === SisconcapFaseOptions.FASE_II) {
        //     include.evaluacionResumenFase2 = true;
        // } else if (fase === SisconcapFaseOptions.FASE_III) {
        //     include.evaluacionResumenFase3 = true;
        // }

        // Obtener movimientos en el rango
        const movimientos = await this.r19Movimientos.findMany({
            where,
            include: {
                evaluacionResumenFase1: true,
                evaluacionResumenFase2: true,
                evaluacionResumenFase3: true,
                sucursal: true,
            },
        });

        // Map agrupado por mes y sucursal
        const mesesMap = new Map<string, SisconcapHistoricoSucursalDto[]>();

        // Totales globales
        const totales: SisconcapHistoricoTotalesGlobalesDto = {
            totalMovimientos: 0,
            totalAnomalias: 0,
            totalPromedio: 0,
        };

        // Recorrido principal
        for (const mov of movimientos) {
            const mes = this.obtenerMesNombre(new Date(mov.R19FRev));
            if (!mesesMap.has(mes)) mesesMap.set(mes, []);

            const sucursales = mesesMap.get(mes)!;
            let suc = sucursales.find(s => s.sucursal === mov.sucursal.R11Nom);

            if (!suc) {
                suc = {
                    sucursal: mov.sucursal.R11Nom,
                    totalMovimientos: 0,
                    totalAnomalias: 0,
                    totalPromedio: 0,
                };
                sucursales.push(suc);
            }

            // Contar movimiento
            suc.totalMovimientos += 1;
            totales.totalMovimientos += 1;

            // Determinar anomalias por fase
            let anomalias = 0;
            if (fase === SisconcapFaseOptions.FASE_I) {
                anomalias = mov.evaluacionResumenFase1?.R21Ha ?? 0;
            } else if (fase === SisconcapFaseOptions.FASE_II) {
                anomalias = mov.evaluacionResumenFase2?.R23PSolv ?? 0;
            } else if (fase === SisconcapFaseOptions.FASE_III) {
                anomalias = mov.evaluacionResumenFase3?.R25PSolv ?? 0;
            }

            suc.totalAnomalias += anomalias;
            totales.totalAnomalias += anomalias;
        }

        // Calcular promedios
        mesesMap.forEach(sucursales => {
            sucursales.forEach(s => {
                s.totalPromedio =
                    s.totalMovimientos > 0
                        ? Math.round(Number((s.totalAnomalias / s.totalMovimientos)))
                        : 0;
            });
        });

        totales.totalPromedio =
            totales.totalMovimientos > 0
                ? Math.round(Number((totales.totalAnomalias / totales.totalMovimientos)))
                : 0;

        // Estructurar DTO final
        const meses: SisconcapHistoricoMesDto[] = Array.from(mesesMap.entries()).map(
            ([mes, sucursales]) => ({
                mes,
                sucursales,
            }),
        );

        return { meses, totales };
    }

}