import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Movimiento, PrismaClient } from "@prisma/client";
import { Usuario } from "src/common/entities/usuario.entity";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ResultadosSeguimientoResponse, ReporteCategoriaF2Response, ReporteSucursalF2Response } from "../dto/fase2/resultados-seguimiento-response.output";

@Injectable()
export class ReporteFase3Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReporteFase3Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    async getResultadosFinales(
        filtro: FiltroFechasInput,
        user: Usuario,
    ): Promise<ResultadosSeguimientoResponse> {
        const { fechaInicio, fechaFinal } = filtro;

        const registros = await this.r25EvaluacionResumenFase3.findMany({
            where: {
                movimiento: {
                    R19Coop_id: user.R12Coop_id,
                    R19FRev: {
                        gte: fechaInicio,
                        lte: fechaFinal,
                    },
                },
            },
            include: {
                movimiento: { include: { sucursal: true } },
            },
        });

        const tiposEncontrados = Array.from(
            new Set(registros.map((r) => r.movimiento?.R19TipoMov)),
        );
        // this._logger.debug('Tipos de movimiento en registros F3:', tiposEncontrados);

        const CATEGORY_MAP: Record<string, Movimiento> = {
            ingresos: Movimiento.ALTA,
            aperturas: Movimiento.APERTURA,
            actualizaciones: Movimiento.ACTUALIZACION,
            bajas: Movimiento.BAJA,
        };

        const buildCategoria = (movTipo: Movimiento): ReporteCategoriaF2Response => {
            const sucMap = new Map<string, ReporteSucursalF2Response>();
            const filtered = registros.filter(
                (r) => r.movimiento.R19TipoMov === movTipo,
            );

            for (const r of filtered) {
                const sucName = r.movimiento?.sucursal?.R11Nom ?? 'Sin Sucursal';

                if (!sucMap.has(sucName)) {
                    sucMap.set(sucName, {
                        sucursal: sucName,
                        conteo: 0,
                        correctos: 0,
                        pctCorrectos: 0,
                        deficientes: 0,
                        pctDeficientes: 0,
                        anomaliasPrevias: 0,
                        solventadas: 0,
                        pctSolventadas: 0,
                        noSolventadas: 0,
                        pctNoSolventadas: 0,
                    });
                }

                const s = sucMap.get(sucName)!;

                // Conteo total de expedientes (revisiones fase 3)
                s.conteo += 1;

                // Clasificación de correctos / deficientes (por calificativo)
                if (r.R25Cal === 'CORRECTO') s.correctos += 1;
                else s.deficientes += 1;

                // Anomalías previas = solventadas + no solventadas (de la fase anterior)
                const solv = Number(r.R25Solv ?? 0);
                const psolv = Number(r.R25PSolv ?? 0);
                s.anomaliasPrevias += solv + psolv;
                s.solventadas += solv;
                s.noSolventadas += psolv;
            }

            // Calcular porcentajes por sucursal
            for (const s of sucMap.values()) {
                s.pctCorrectos = s.conteo
                    ? Math.round((s.correctos / s.conteo) * 100)
                    : 0;
                s.pctDeficientes = s.conteo
                    ? Math.round((s.deficientes / s.conteo) * 100)
                    : 0;
                s.pctSolventadas = s.anomaliasPrevias
                    ? Math.round((s.solventadas / s.anomaliasPrevias) * 100)
                    : 0;
                s.pctNoSolventadas = s.anomaliasPrevias
                    ? Math.round((s.noSolventadas / s.anomaliasPrevias) * 100)
                    : 0;
            }

            const sucursales = Array.from(sucMap.values());

            // Totales globales por categoría
            const totals = sucursales.reduce(
                (acc, s) => {
                    acc.conteo += s.conteo;
                    acc.correctos += s.correctos;
                    acc.deficientes += s.deficientes;
                    acc.anomaliasPrevias += s.anomaliasPrevias;
                    acc.solventadas += s.solventadas;
                    acc.noSolventadas += s.noSolventadas;
                    return acc;
                },
                {
                    conteo: 0,
                    correctos: 0,
                    deficientes: 0,
                    anomaliasPrevias: 0,
                    solventadas: 0,
                    noSolventadas: 0,
                },
            );

            return {
                sucursales,
                conteo: totals.conteo,
                correctos: totals.correctos,
                pctCorrectos: totals.conteo
                    ? Math.round((totals.correctos / totals.conteo) * 100)
                    : 0,
                deficientes: totals.deficientes,
                pctDeficientes: totals.conteo
                    ? Math.round((totals.deficientes / totals.conteo) * 100)
                    : 0,
                anomaliasPrevias: totals.anomaliasPrevias,
                solventadas: totals.solventadas,
                pctSolventadas: totals.anomaliasPrevias
                    ? Math.round((totals.solventadas / totals.anomaliasPrevias) * 100)
                    : 0,
                noSolventadas: totals.noSolventadas,
                pctNoSolventadas: totals.anomaliasPrevias
                    ? Math.round((totals.noSolventadas / totals.anomaliasPrevias) * 100)
                    : 0,
            };
        };

        // Construir resultado completo (todas las categorías)
        return {
            ingresos: buildCategoria(CATEGORY_MAP.ingresos),
            aperturas: buildCategoria(CATEGORY_MAP.aperturas),
            actualizaciones: buildCategoria(CATEGORY_MAP.actualizaciones),
            bajas: buildCategoria(CATEGORY_MAP.bajas),
        };
    }

}