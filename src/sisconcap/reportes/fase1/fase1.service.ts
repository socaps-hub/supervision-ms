import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Calificativo, Movimiento, PrismaClient, Movimiento as Mov } from '@prisma/client';
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ReporteFase1Response } from "../dto/fase1/reporte-segmentado-response.output";
import { Usuario } from "src/common/entities/usuario.entity";
import { ResumenAnomaliasSucAndEjecutivosCategoriaResponse, ResumenAnomaliasSucAndEjecutivosEjecutivoResponse, ResumenAnomaliasSucAndEjecutivosResponseDto, ResumenAnomaliasSucAndEjecutivosSucursalResponse } from "../dto/fase1/resumen-anomalias-suc-with-ejecutivos-response.output";
import { ResumenAnomaliasArgs } from "../dto/fase1/arg/resumen-anomalias.args";

@Injectable()
export class ReporteFase1Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReportesFase1Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    async getReporteSegmentado(
        filtro: FiltroFechasInput,
        user: Usuario,
    ): Promise<ReporteFase1Response> {
        const { fechaInicio, fechaFinal, grupoId } = filtro;

        try {
            const movimientos = await this.r19Movimientos.findMany({
                where: {
                    R19FRev: {
                        gte: fechaInicio,
                        lte: fechaFinal,
                    },
                    R19Coop_id: user.R12Coop_id,
                    ...(grupoId && { R19Coop_id: grupoId }),
                    evaluacionResumenFase1: {
                        // Solo considerar los movimientos que tengan resumen fase 1
                        isNot: null,
                    },
                },
                include: {
                    sucursal: true,
                    evaluacionResumenFase1: true,
                },
            });

            // Estructura inicial de cada bloque
            const buildBlock = () => ({
                sucursales: [] as any[],
                movimientos: 0,
                conteo: 0,
                sinObservacion: 0,
                conObservacion: 0,
                anomalias: 0,
            });

            const ingresos = buildBlock();
            const aperturas = buildBlock();
            const actualizaciones = buildBlock();
            const bajas = buildBlock();

            // Agrupamos por sucursal y tipo de movimiento
            const sucursalesMap = new Map<
                string,
                {
                    ingresos: any;
                    aperturas: any;
                    actualizaciones: any;
                    bajas: any;
                    totalSucursal: number;
                }
            >();

            for (const mov of movimientos) {
                const sucursalNombre = mov.sucursal.R11Nom;
                const resumen = mov.evaluacionResumenFase1;

                if (!sucursalesMap.has(sucursalNombre)) {
                    sucursalesMap.set(sucursalNombre, {
                        ingresos: { sucursal: sucursalNombre, movimientos: 0, movimientosSuc: 0, conteo: 0, sinObservacion: 0, conObservacion: 0, anomalias: 0 },
                        aperturas: { sucursal: sucursalNombre, movimientos: 0, movimientosSuc: 0, conteo: 0, sinObservacion: 0, conObservacion: 0, anomalias: 0 },
                        actualizaciones: { sucursal: sucursalNombre, movimientos: 0, movimientosSuc: 0, conteo: 0, sinObservacion: 0, conObservacion: 0, anomalias: 0 },
                        bajas: { sucursal: sucursalNombre, movimientos: 0, movimientosSuc: 0, conteo: 0, sinObservacion: 0, conObservacion: 0, anomalias: 0 },
                        totalSucursal: 0, // 👈 contador auxiliar
                    });
                }

                const sucursalData = sucursalesMap.get(sucursalNombre)!;
                sucursalData.totalSucursal++; // 👈 contar siempre, sin importar la categoría

                // Dependiendo del tipo de movimiento actualizamos el bloque
                let targetBlock;
                switch (mov.R19TipoMov) {
                    case Movimiento.ALTA:
                        targetBlock = sucursalData.ingresos;
                        break;
                    case Movimiento.APERTURA:
                        targetBlock = sucursalData.aperturas;
                        break;
                    case Movimiento.ACTUALIZACION:
                        targetBlock = sucursalData.actualizaciones;
                        break;
                    case Movimiento.BAJA:
                        targetBlock = sucursalData.bajas;
                        break;
                    default:
                        continue;
                }

                // targetBlock.movimientos++;
                targetBlock.conteo++;
                if (resumen?.R21Cal === Calificativo.CORRECTO) {
                    targetBlock.sinObservacion++;
                } else if (resumen?.R21Cal === Calificativo.DEFICIENTE) {
                    targetBlock.conObservacion++;
                }
                targetBlock.anomalias += resumen?.R21Ha;
            }

            // Consolidar globales
            for (const sucursalData of sucursalesMap.values()) {
                sucursalData.ingresos.movimientosSuc = sucursalData.totalSucursal;
                sucursalData.aperturas.movimientosSuc = sucursalData.totalSucursal;
                sucursalData.actualizaciones.movimientosSuc = sucursalData.totalSucursal;
                sucursalData.bajas.movimientosSuc = sucursalData.totalSucursal;

                ingresos.sucursales.push(sucursalData.ingresos);
                aperturas.sucursales.push(sucursalData.aperturas);
                actualizaciones.sucursales.push(sucursalData.actualizaciones);
                bajas.sucursales.push(sucursalData.bajas);

                // Globales de ingresos
                ingresos.movimientos = movimientos.length
                ingresos.conteo += sucursalData.ingresos.conteo;
                ingresos.sinObservacion += sucursalData.ingresos.sinObservacion;
                ingresos.conObservacion += sucursalData.ingresos.conObservacion;
                ingresos.anomalias += sucursalData.ingresos.anomalias;

                // Globales de aperturas
                aperturas.movimientos = movimientos.length
                aperturas.conteo += sucursalData.aperturas.conteo;
                aperturas.sinObservacion += sucursalData.aperturas.sinObservacion;
                aperturas.conObservacion += sucursalData.aperturas.conObservacion;
                aperturas.anomalias += sucursalData.aperturas.anomalias;

                // Globales de actualizaciones
                actualizaciones.movimientos = movimientos.length
                actualizaciones.conteo += sucursalData.actualizaciones.conteo;
                actualizaciones.sinObservacion += sucursalData.actualizaciones.sinObservacion;
                actualizaciones.conObservacion += sucursalData.actualizaciones.conObservacion;
                actualizaciones.anomalias += sucursalData.actualizaciones.anomalias;

                // Globales de bajas
                bajas.movimientos = movimientos.length
                bajas.conteo += sucursalData.bajas.conteo;
                bajas.sinObservacion += sucursalData.bajas.sinObservacion;
                bajas.conObservacion += sucursalData.bajas.conObservacion;
                bajas.anomalias += sucursalData.bajas.anomalias;
            }

            return {
                ingresos,
                aperturas,
                actualizaciones,
                bajas,
            };
        } catch (error) {
            this._logger.error('❌ Error al generar reporte de fase 1:', error);
            throw error;
        }
    }

    async getResumenAnomaliasSucursales(
        filtro: FiltroFechasInput,
        user: Usuario,
    ): Promise<ResumenAnomaliasSucAndEjecutivosResponseDto> {
        const { fechaInicio, fechaFinal } = filtro;

        const res = await this.r21EvaluacionResumenFase1.findMany({
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
                movimiento: {
                    include: {
                        sucursal: true,
                    },
                },
            },
        });

        // Helper para construir categoría SIN ejecutivos
        const buildCategoria = (categoria: string): ResumenAnomaliasSucAndEjecutivosCategoriaResponse => {
            const filtrados = res.filter(r => r.movimiento.R19TipoMov === categoria.toUpperCase());

            const sucMap = new Map<string, ResumenAnomaliasSucAndEjecutivosSucursalResponse>();

            for (const r of filtrados) {
                const sucName = r.movimiento.sucursal.R11Nom;

                if (!sucMap.has(sucName)) {
                    sucMap.set(sucName, {
                        sucursal: sucName,
                        movimientos: 0,
                        anomalias: 0,
                        erroresPromedio: 0,
                        correctos: 0,
                        pctCorrectos: 0,
                        deficientes: 0,
                        pctDeficientes: 0,
                        ejecutivos: [], // 🚨 vacío de momento
                    });
                }

                const suc = sucMap.get(sucName)!;
                suc.movimientos += 1;
                suc.anomalias += r.R21Ha;
                if (r.R21Cal === 'CORRECTO') suc.correctos += 1;
                else suc.deficientes += 1;
            }

            const sucursales = Array.from(sucMap.values()).map(s => {
                s.pctCorrectos = s.movimientos ? Math.round((s.correctos / s.movimientos) * 100) : 0;
                s.pctDeficientes = s.movimientos ? Math.round((s.deficientes / s.movimientos) * 100) : 0;
                s.erroresPromedio = s.movimientos ? Math.round(s.anomalias / s.movimientos) : 0;
                return s;
            });

            const totalMov = sucursales.reduce((a, s) => a + s.movimientos, 0);
            const totalCorr = sucursales.reduce((a, s) => a + s.correctos, 0);
            const totalDef = sucursales.reduce((a, s) => a + s.deficientes, 0);
            const totalAnom = sucursales.reduce((a, s) => a + s.anomalias, 0);

            return {
                sucursales,
                movimientos: totalMov,
                anomalias: totalAnom,
                erroresPromedio: totalMov > 0 ? Math.round(totalAnom / totalMov) : 0,
                correctos: totalCorr,
                pctCorrectos: totalMov ? Math.round((totalCorr / totalMov) * 100) : 0,
                deficientes: totalDef,
                pctDeficientes: totalMov ? Math.round((totalDef / totalMov) * 100) : 0,
            };
        };

        return {
            ingresos: buildCategoria('ALTA'),
            aperturas: buildCategoria('APERTURA'),
            actualizaciones: buildCategoria('ACTUALIZACION'),
            bajas: buildCategoria('BAJA'),
        };
    }

    async getResumenAnomaliasEjecutivosPorSucursal(
        resumenAnomaliasArgs: ResumenAnomaliasArgs,
        user: Usuario,
    ): Promise<ResumenAnomaliasSucAndEjecutivosEjecutivoResponse[]> {
        const { categoria, sucursal, filtro } = resumenAnomaliasArgs;
        const { fechaInicio, fechaFinal } = filtro;

        const res = await this.r21EvaluacionResumenFase1.findMany({
            where: {
                movimiento: {
                    R19Coop_id: user.R12Coop_id,
                    R19TipoMov: categoria.toUpperCase() as Movimiento,
                    sucursal: { R11Nom: sucursal },
                    R19FRev: {
                        gte: fechaInicio,
                        lte: fechaFinal,
                    },
                },
            },
            include: {
                ejecutivo: true,
            },
        });

        const map = new Map<string, ResumenAnomaliasSucAndEjecutivosEjecutivoResponse>();

        for (const r of res) {
            const ejvo = r.ejecutivo;

            if (!map.has(ejvo.R12Ni)) {
                map.set(ejvo.R12Ni, {
                    user: ejvo.R12Ni,
                    nombre: ejvo.R12Nom,
                    movimientos: 0,
                    anomalias: 0,
                    erroresPromedio: 0,
                    correctos: 0,
                    pctCorrectos: 0,
                    deficientes: 0,
                    pctDeficientes: 0,
                });
            }

            const ej = map.get(ejvo.R12Ni)!;
            ej.movimientos += 1;
            ej.anomalias += r.R21Ha;
            if (r.R21Cal === 'CORRECTO') ej.correctos += 1;
            else ej.deficientes += 1;
        }

        return Array.from(map.values()).map(e => ({
            ...e,
            pctCorrectos: e.movimientos ? Math.round((e.correctos / e.movimientos) * 100) : 0,
            pctDeficientes: e.movimientos ? Math.round((e.deficientes / e.movimientos) * 100) : 0,
            erroresPromedio: e.movimientos ? Math.round(e.anomalias / e.movimientos) : 0,
        }));
    }

    async getResumenAnomaliasGlobalAgrupadoPorSucursal(
        filtro: FiltroFechasInput,
        user: Usuario,
    ): Promise<ResumenAnomaliasSucAndEjecutivosCategoriaResponse> {
        const { fechaInicio, fechaFinal } = filtro;

        // 1️⃣ Obtener todos los registros de resúmenes de Fase 1 dentro del rango
        const res = await this.r21EvaluacionResumenFase1.findMany({
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
                movimiento: {
                    select: {
                        sucursal: { select: { R11Nom: true } },
                    },
                },
                ejecutivo: true,
            },
        });

        // 2️⃣ Agrupar por sucursal
        const sucursalMap = new Map<
            string,
            {
                sucursal: string;
                movimientos: number;
                anomalias: number;
                correctos: number;
                deficientes: number;
                ejecutivos: Map<string, ResumenAnomaliasSucAndEjecutivosEjecutivoResponse>;
            }
        >();

        for (const r of res) {
            const sucursalName = r.movimiento.sucursal?.R11Nom || 'SIN SUCURSAL';
            const ejvo = r.ejecutivo;

            // Crear sucursal si no existe
            if (!sucursalMap.has(sucursalName)) {
                sucursalMap.set(sucursalName, {
                    sucursal: sucursalName,
                    movimientos: 0,
                    anomalias: 0,
                    correctos: 0,
                    deficientes: 0,
                    ejecutivos: new Map(),
                });
            }

            const sucursalData = sucursalMap.get(sucursalName)!;
            sucursalData.movimientos += 1;
            sucursalData.anomalias += r.R21Ha;
            if (r.R21Cal === 'CORRECTO') sucursalData.correctos += 1;
            else sucursalData.deficientes += 1;

            // Crear o actualizar ejecutivo dentro de la sucursal
            if (!sucursalData.ejecutivos.has(ejvo.R12Ni)) {
                sucursalData.ejecutivos.set(ejvo.R12Ni, {
                    user: ejvo.R12Ni,
                    nombre: ejvo.R12Nom,
                    movimientos: 0,
                    anomalias: 0,
                    erroresPromedio: 0,
                    correctos: 0,
                    pctCorrectos: 0,
                    deficientes: 0,
                    pctDeficientes: 0,
                });
            }

            const ej = sucursalData.ejecutivos.get(ejvo.R12Ni)!;
            ej.movimientos += 1;
            ej.anomalias += r.R21Ha;
            if (r.R21Cal === 'CORRECTO') ej.correctos += 1;
            else ej.deficientes += 1;
        }

        // 3️⃣ Construir respuesta de sucursales
        const sucursalesArray: ResumenAnomaliasSucAndEjecutivosSucursalResponse[] = [];
        let globalMovimientos = 0;
        let globalAnomalias = 0;
        let globalCorrectos = 0;
        let globalDeficientes = 0;

        for (const [, sucursal] of sucursalMap) {
            const ejecutivosArray = Array.from(sucursal.ejecutivos.values()).map((e) => ({
                ...e,
                pctCorrectos: e.movimientos ? Math.round((e.correctos / e.movimientos) * 100) : 0,
                pctDeficientes: e.movimientos ? Math.round((e.deficientes / e.movimientos) * 100) : 0,
                erroresPromedio: e.movimientos ? Math.round(e.anomalias / e.movimientos) : 0,
            }));

            const sucursalResumen: ResumenAnomaliasSucAndEjecutivosSucursalResponse = {
                sucursal: sucursal.sucursal,
                movimientos: sucursal.movimientos,
                anomalias: sucursal.anomalias,
                erroresPromedio: sucursal.movimientos
                    ? Math.round(sucursal.anomalias / sucursal.movimientos)
                    : 0,
                correctos: sucursal.correctos,
                pctCorrectos: sucursal.movimientos
                    ? Math.round((sucursal.correctos / sucursal.movimientos) * 100)
                    : 0,
                deficientes: sucursal.deficientes,
                pctDeficientes: sucursal.movimientos
                    ? Math.round((sucursal.deficientes / sucursal.movimientos) * 100)
                    : 0,
                ejecutivos: ejecutivosArray,
            };

            sucursalesArray.push(sucursalResumen);

            // Acumuladores globales
            globalMovimientos += sucursal.movimientos;
            globalAnomalias += sucursal.anomalias;
            globalCorrectos += sucursal.correctos;
            globalDeficientes += sucursal.deficientes;
        }

        // 4️⃣ Construir totales globales
        const globalErroresPromedio = globalMovimientos
            ? Math.round(globalAnomalias / globalMovimientos)
            : 0;
        const globalPctCorrectos = globalMovimientos
            ? Math.round((globalCorrectos / globalMovimientos) * 100)
            : 0;
        const globalPctDeficientes = globalMovimientos
            ? Math.round((globalDeficientes / globalMovimientos) * 100)
            : 0;

        // 5️⃣ Respuesta final compatible con tu clase
        return {
            sucursales: sucursalesArray,
            movimientos: globalMovimientos,
            anomalias: globalAnomalias,
            erroresPromedio: globalErroresPromedio,
            correctos: globalCorrectos,
            pctCorrectos: globalPctCorrectos,
            deficientes: globalDeficientes,
            pctDeficientes: globalPctDeficientes,
        };
    }


}