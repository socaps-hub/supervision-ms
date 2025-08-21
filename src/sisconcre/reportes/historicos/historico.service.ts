// src/historico/historico.service.ts
import { format } from 'path';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Fase, HistoricoFiltroInput } from '../dto/historicos/inputs/filtro-historico-reporte.input';
import { HistoricoMesDto, HistoricoResponseDto, HistoricoSucursalDto, HistoricoTotalesGlobalesDto } from '../dto/historicos/historico-response.dto';
import { Usuario } from 'src/common/entities/usuario.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class HistoricoService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('HistoricoService')

    private meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    private obtenerMesNombre(fecha: Date): string {
        return this.meses[fecha.getMonth()];
    }

    async generarReporteHistorico(input: HistoricoFiltroInput, user: Usuario): Promise<HistoricoResponseDto> {
        switch (input.fase) {
            case Fase.FASE_I:
                return this.reporteFaseI(input, user);
            case Fase.FASE_II:
                return this.reporteFaseII(input, user);
            case Fase.FASE_III:
                return this.reporteFaseIII(input, user);
            case Fase.FASE_IV:
                if (!input.subFaseIV) {
                    // throw new Error('Para la Fase IV debes especificar subFaseIV');
                    throw new RpcException({
                        message: 'Para la Fase IV debes especificar subFaseIV',
                        status: HttpStatus.BAD_REQUEST
                    })
                }
                return this.reporteFaseIV(input, user);
        }
    }

     /** Función genérica de agrupamiento */
    private agruparPorMesYSucursal(
        prestamos: any[],
        extraerValores: (p: any, subFaseIV?: string) => Partial<HistoricoSucursalDto>,
        subFaseIV?: string
    ): HistoricoResponseDto {
        const mesesMap = new Map<string, HistoricoSucursalDto[]>();

        const totales: HistoricoTotalesGlobalesDto = {
            totalSolicitudes: 0,
            totalAnomalias: 0,
            promedioAnomalias: undefined,
            totalAnomaliasF1: 0,
            totalSolventados: 0,
            totalAnomaliasF3: 0,
            totalPendientes: 0,
            totalNoSolventadosF1: 0,
            totalNoSolventadosF3: 0,
            totalPendientesCubiertos: 0,
            totalPendientesPorCubrir: 0,
        };

        for (const p of prestamos) {
            const mes = this.obtenerMesNombre(new Date(p.R01FRev));

            if (!mesesMap.has(mes)) mesesMap.set(mes, []);

            const sucursales = mesesMap.get(mes)!;
            let grupo = sucursales.find(s => s.sucursal === p.sucursal.R11Nom);

            if (!grupo) {
                grupo = { sucursal: p.sucursal.R11Nom, totalSolicitudes: 0 };
                sucursales.push(grupo);
            }

            grupo.totalSolicitudes += 1;

            const valores = extraerValores(p, subFaseIV);
            Object.keys(valores).forEach(k => {
                // @ts-ignore
                grupo[k] = (grupo[k] ?? 0) + (valores[k] ?? 0);
            });

            // Totales globales
            Object.keys(valores).forEach(k => {
                const key = k as keyof HistoricoTotalesGlobalesDto;
                // @ts-ignore
                totales[key] = (totales[key] ?? 0) + (valores[k] ?? 0);
            });
            totales.totalSolicitudes += 1;
        }

        // Calcular promedio global y por sucursal
        mesesMap.forEach(sucursales => {
            sucursales.forEach(s => {
                if (s.totalAnomalias !== undefined) {
                    s.promedioAnomalias = s.totalAnomalias / s.totalSolicitudes;
                }
            });
        });

        if (totales.totalAnomalias !== undefined) {
            totales.promedioAnomalias = totales.totalAnomalias / (totales.totalSolicitudes || 1);
        }

        const meses: HistoricoMesDto[] = Array.from(mesesMap.entries()).map(([mes, sucursales]) => ({
            mes,
            sucursales,
        }));

        return { meses, totales };
    }


    private async reporteFaseI(input: HistoricoFiltroInput, user: Usuario): Promise<HistoricoResponseDto> {
        const prestamos = await this.r01Prestamo.findMany({
            where: { 
                resumenF1: { isNot: null }, 
                R01FRev: { 
                    gte: new Date(input.fechaInicio).toISOString(), 
                    lte: new Date(input.fechaFinal).toISOString() 
                },
                R01Coop_id: user.R12Coop_id
            },
            include: { sucursal: true, resumenF1: true },
        });

        return this.agruparPorMesYSucursal(prestamos, (p) => ({
            totalAnomalias: (p.resumenF1?.R06Ha ?? 0) + (p.resumenF1?.R06Hm ?? 0) + (p.resumenF1?.R06Hb ?? 0)
        }));
    }

    private async reporteFaseII(input: HistoricoFiltroInput, user: Usuario): Promise<HistoricoResponseDto> {
        const prestamos = await this.r01Prestamo.findMany({
            where: { 
                resumenF2: { isNot: null }, 
                R01FRev: { 
                    gte: new Date(input.fechaInicio).toISOString(), 
                    lte: new Date(input.fechaFinal).toISOString() 
                },
                R01Coop_id: user.R12Coop_id
            },
            include: { sucursal: true, resumenF1: true, resumenF2: true },
        });

        return this.agruparPorMesYSucursal(prestamos, (p) => ({
            totalAnomaliasF1: (p.resumenF1?.R06Ha ?? 0) + (p.resumenF1?.R06Hm ?? 0) + (p.resumenF1?.R06Hb ?? 0),
            totalSolventados: p.resumenF2?.R08SolvT ?? 0
        }));
    }

    private async reporteFaseIII(input: HistoricoFiltroInput, user: Usuario): Promise<HistoricoResponseDto> {
        const prestamos = await this.r01Prestamo.findMany({
            where: { 
                resumenF3: { isNot: null }, 
                R01FRev: { 
                    gte: new Date(input.fechaInicio).toISOString(), 
                    lte: new Date(input.fechaFinal).toISOString() 
                },
                R01Coop_id: user.R12Coop_id
            },
            include: { sucursal: true, resumenF3: true },
        });

        return this.agruparPorMesYSucursal(prestamos, (p) => ({
            totalAnomaliasF3: p.resumenF3?.R10Ha ?? 0,
            totalPendientes: p.resumenF3?.R10Pendientes ?? 0
        }));
    }

    private async reporteFaseIV(input: HistoricoFiltroInput, user: Usuario): Promise<HistoricoResponseDto> {
        const prestamos = await this.r01Prestamo.findMany({
            where: { 
                resumenF4: { isNot: null }, 
                R01FRev: { 
                    gte: new Date(input.fechaInicio).toISOString(), 
                    lte: new Date(input.fechaFinal).toISOString() 
                },
                R01Coop_id: user.R12Coop_id
            },
            include: { sucursal: true, resumenF1: true, resumenF3: true, resumenF4: true },
        });

        return this.agruparPorMesYSucursal(prestamos, (p, subFaseIV) => {
            if (subFaseIV === 'LEVANTAMIENTOS') {
                const anomalias = (p.resumenF1?.R06Ha ?? 0) + (p.resumenF1?.R06Hm ?? 0) + (p.resumenF1?.R06Hb ?? 0);
                const solventados = p.resumenF4?.R16SolvT ?? 0;
                return {
                    totalAnomalias: anomalias,
                    totalSolventados: solventados,
                    totalNoSolventadosF1: anomalias - solventados
                };
            } else {
                const anomF3 = p.resumenF3?.R10Ha ?? 0;
                const solventados = p.resumenF4?.R16HaSolv ?? 0;
                const pendientes = p.resumenF3?.R10Pendientes ?? 0;
                const pendientesCubiertos = p.resumenF4?.R16PenCu ?? 0;
                return {
                    totalAnomaliasF3: anomF3,
                    totalSolventados: solventados,
                    totalNoSolventadosF3: anomF3 - solventados,
                    totalPendientes: pendientes,
                    totalPendientesCubiertos: pendientesCubiertos,
                    totalPendientesPorCubrir: pendientes - pendientesCubiertos
                };
            }
        }, input.subFaseIV);
    }
}
