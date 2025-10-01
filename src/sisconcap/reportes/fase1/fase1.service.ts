import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Calificativo, Movimiento, PrismaClient } from "@prisma/client";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ReporteFase1Response } from "../dto/fase1/reporte-segmentado-response.output";
import { Usuario } from "src/common/entities/usuario.entity";

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

}