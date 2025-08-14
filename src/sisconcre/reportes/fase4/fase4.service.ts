import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Calificativo, PrismaClient } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import { Usuario } from "src/common/entities/usuario.entity";

import { NATS_SERVICE } from "src/config";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ReporteFase4Response, ReporteFase4SucursalDto } from "../dto/fase4/reporte-global.dto";

@Injectable()
export class ReporteFase4Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReporteFase4Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    constructor(
        @Inject(NATS_SERVICE) private readonly _client: ClientProxy
    ) {
        super()
    }

    async getReporteGlobalF4(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase4Response> {
        const { fechaInicio, fechaFinal } = input;

        // const sucursales = await firstValueFrom(
        //     this._client.send('config.sucursales.getAll', { user })
        // );

        // 🔹 Obtener solicitudes con resumen de fase 4 y sus fases previas
        const solicitudes = await this.r16EvaluacionResumenFase4.findMany({
            where: {
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                    R01FRec: {
                        gte: new Date(fechaInicio).toISOString(),
                        lte: new Date(fechaFinal).toISOString(),
                    },
                },
            },
            include: {
                prestamo: {
                    include: {
                        sucursal: true,
                        resumenF1: true,
                        resumenF3: {
                            include: { evaluador: true }
                        },
                        resumenF4: true,
                        ejecutivo: true
                    },
                },
            },
        });

        const sucursalesMap = new Map<string, ReporteFase4SucursalDto>();

        for (const solicitud of solicitudes) {
            const sucId = solicitud.prestamo.sucursal?.R11Id ?? '0';
            const sucNom = solicitud.prestamo.sucursal?.R11Nom ?? 'Desconocida';
            if (!sucursalesMap.has(sucId)) {
                sucursalesMap.set(sucId, {
                    id: sucId,
                    nombre: sucNom,
                    totalSolicitudes: 0,
                    correctas: 0,
                    correctasPct: 0,
                    deficientes: 0,
                    deficientesPct: 0,
                    pendientes: 0,
                    pendientesPct: 0,
                    anomalias: 0,
                    solventadas: 0,
                    solventadasPct: 0,
                    noSolventadas: 0,
                    noSolventadasPct: 0,
                    anomaliasDesembolso: 0,
                    solventadasDesembolso: 0,
                    solventadasDesembolsoPct: 0,
                    noSolventadasDesembolso: 0,
                    noSolventadasDesembolsoPct: 0,
                    pendientesF3: 0,
                    pendientesSolventados: 0,
                    pendientesPorCubrir: 0,
                    anomaliasTotalesPorSolventar: 0,
                    anomaliasTotalesPorSolventarPct: 0,
                    ejecutivos: [],
                });
            }

            const sucursal = sucursalesMap.get(sucId)!;
            sucursal.totalSolicitudes++;

            const resumen4 = solicitud.prestamo.resumenF4;
            const resumen1 = solicitud.prestamo.resumenF1;
            const resumen3 = solicitud.prestamo.resumenF3;

            // Clasificación F4
            if (resumen4?.R16CalF === Calificativo.CORRECTO) sucursal.correctas++;
            else if (resumen4?.R16CalF === Calificativo.DEFICIENTE) sucursal.deficientes++;
            else if (resumen4?.R16CalF === Calificativo.PENDIENTE) sucursal.pendientes++;

            // Anomalías F1
            const anomF1 = (resumen1?.R06Ha ?? 0) + (resumen1?.R06Hm ?? 0) + (resumen1?.R06Hb ?? 0);
            sucursal.anomalias += anomF1;

            // Solventadas F4
            sucursal.solventadas += resumen4?.R16SolvT ?? 0;

            // Anomalías desembolso F3
            sucursal.anomaliasDesembolso += resumen3?.R10Ha ?? 0;

            // Solventadas desembolso F4
            sucursal.solventadasDesembolso += resumen4?.R16HaSolv ?? 0;

            // Pendientes F3
            sucursal.pendientesF3 += resumen3?.R10Pendientes ?? 0;

            // Pendientes solventados F4
            sucursal.pendientesSolventados += resumen4?.R16PenCu ?? 0;

            // Inicializar ejecutivo
            const ejeId = solicitud.prestamo.resumenF3?.evaluador.R12Id ?? '0';
            const ejeUsuario = solicitud.prestamo.resumenF3?.evaluador.R12Ni ?? '0';
            const ejeNom = solicitud.prestamo.resumenF3?.evaluador.R12Nom ?? 'Sin asignar';
            let ejecutivo = sucursal.ejecutivos.find(e => e.id === ejeId);
            if (!ejecutivo) {
                ejecutivo = {
                    id: ejeId,
                    usuario: ejeUsuario,
                    nombre: ejeNom,
                    totalSolicitudes: 0,
                    correctas: 0,
                    correctasPct: 0,
                    deficientes: 0,
                    deficientesPct: 0,
                    pendientes: 0,
                    pendientesPct: 0,
                    anomalias: 0,
                    solventadas: 0,
                    solventadasPct: 0,
                    noSolventadas: 0,
                    noSolventadasPct: 0,
                    anomaliasDesembolso: 0,
                    solventadasDesembolso: 0,
                    solventadasDesembolsoPct: 0,
                    noSolventadasDesembolso: 0,
                    noSolventadasDesembolsoPct: 0,
                    pendientesF3: 0,
                    pendientesSolventados: 0,
                    pendientesPorCubrir: 0,
                    anomaliasTotalesPorSolventar: 0,
                    anomaliasTotalesPorSolventarPct: 0,
                };
                sucursal.ejecutivos.push(ejecutivo);
            }

            // Agregar a ejecutivo
            ejecutivo.totalSolicitudes++;
            if (resumen4?.R16CalF === Calificativo.CORRECTO) ejecutivo.correctas++;
            else if (resumen4?.R16CalF === Calificativo.DEFICIENTE) ejecutivo.deficientes++;
            else if (resumen4?.R16CalF === Calificativo.PENDIENTE) ejecutivo.pendientes++;
            ejecutivo.anomalias += anomF1;
            ejecutivo.solventadas += resumen4?.R16SolvT ?? 0;
            ejecutivo.anomaliasDesembolso += resumen3?.R10Ha ?? 0;
            ejecutivo.solventadasDesembolso += resumen4?.R16HaSolv ?? 0;
            ejecutivo.pendientesF3 += resumen3?.R10Pendientes ?? 0;
            ejecutivo.pendientesSolventados += resumen4?.R16PenCu ?? 0;
        }

        // Calcular derivados
        let totalSolicitudesGlobal = 0;
        let totalCorrectasGlobal = 0;
        let totalDeficientesGlobal = 0;
        let totalPendientesGlobal = 0;
        let totalAnomaliasGlobal = 0;
        let totalSolventadasGlobal = 0;
        let totalNoSolventadasGlobal = 0;
        let totalAnomaliasDesembolsoGlobal = 0;
        let totalSolventadasDesembolsoGlobal = 0;
        let totalNoSolventadasDesembolsoGlobal = 0;
        let totalPendientesF3Global = 0;
        let totalPendientesSolventadosGlobal = 0;
        let totalPendientesPorCubrirGlobal = 0;
        let totalAnomaliasTotalesPorSolventarGlobal = 0;

        for (const suc of sucursalesMap.values()) {
            suc.noSolventadas = suc.anomalias - suc.solventadas;
            suc.noSolventadasDesembolso = suc.anomaliasDesembolso - suc.solventadasDesembolso;
            suc.pendientesPorCubrir = suc.pendientesF3 - suc.pendientesSolventados;
            suc.anomaliasTotalesPorSolventar = suc.noSolventadas + suc.noSolventadasDesembolso;

            const anomT = suc.anomalias + suc.anomaliasDesembolso

            suc.correctasPct = suc.totalSolicitudes ? Math.round((suc.correctas / suc.totalSolicitudes) * 100) : 0;
            suc.deficientesPct = suc.totalSolicitudes ? Math.round((suc.deficientes / suc.totalSolicitudes) * 100) : 0;
            suc.pendientesPct = suc.totalSolicitudes ? Math.round((suc.pendientes / suc.totalSolicitudes) * 100) : 0;
            suc.solventadasPct = suc.anomalias ? Math.round((suc.solventadas / suc.anomalias) * 100) : 0;
            suc.noSolventadasPct = suc.anomalias ? Math.round((suc.noSolventadas / suc.anomalias) * 100) : 0;
            suc.solventadasDesembolsoPct = suc.anomaliasDesembolso ? Math.round((suc.solventadasDesembolso / suc.anomaliasDesembolso) * 100) : 0;
            suc.noSolventadasDesembolsoPct = suc.anomaliasDesembolso ? Math.round((suc.noSolventadasDesembolso / suc.anomaliasDesembolso) * 100) : 0;
            suc.anomaliasTotalesPorSolventarPct = anomT ? Math.round((suc.anomaliasTotalesPorSolventar / anomT) * 100) : 0;

            for (const eje of suc.ejecutivos) {
                const anomT = eje.anomalias + eje.anomaliasDesembolso

                eje.noSolventadas = eje.anomalias - eje.solventadas;
                eje.noSolventadasDesembolso = eje.anomaliasDesembolso - eje.solventadasDesembolso;
                eje.pendientesPorCubrir = eje.pendientesF3 - eje.pendientesSolventados;
                eje.anomaliasTotalesPorSolventar = eje.noSolventadas + eje.noSolventadasDesembolso;
                eje.correctasPct = eje.totalSolicitudes ? Math.round((eje.correctas / eje.totalSolicitudes) * 100) : 0;
                eje.deficientesPct = eje.totalSolicitudes ? Math.round((eje.deficientes / eje.totalSolicitudes) * 100) : 0;
                eje.pendientesPct = eje.totalSolicitudes ? Math.round((eje.pendientes / eje.totalSolicitudes) * 100) : 0;
                eje.solventadasPct = eje.anomalias ? Math.round((eje.solventadas / eje.anomalias) * 100) : 0;
                eje.noSolventadasPct = eje.anomalias ? Math.round((eje.noSolventadas / eje.anomalias) * 100) : 0;
                eje.solventadasDesembolsoPct = eje.anomaliasDesembolso ? Math.round((eje.solventadasDesembolsoPct / eje.anomaliasDesembolso) * 100) : 0;
                eje.noSolventadasDesembolsoPct = eje.anomaliasDesembolso ? Math.round((eje.noSolventadasDesembolso / eje.anomaliasDesembolso) * 100) : 0;
                eje.anomaliasTotalesPorSolventarPct = anomT ? Math.round((eje.anomaliasTotalesPorSolventar / anomT) * 100) : 0;
            }

            totalSolicitudesGlobal += suc.totalSolicitudes;
            totalCorrectasGlobal += suc.correctas;
            totalDeficientesGlobal += suc.deficientes;
            totalPendientesGlobal += suc.pendientes;
            totalAnomaliasGlobal += suc.anomalias;
            totalSolventadasGlobal += suc.solventadas;
            totalNoSolventadasGlobal += suc.noSolventadas;
            totalAnomaliasDesembolsoGlobal += suc.anomaliasDesembolso;
            totalSolventadasDesembolsoGlobal += suc.solventadasDesembolso;
            totalNoSolventadasDesembolsoGlobal += suc.noSolventadasDesembolso;
            totalPendientesF3Global += suc.pendientesF3;
            totalPendientesSolventadosGlobal += suc.pendientesSolventados;
            totalPendientesPorCubrirGlobal += suc.pendientesPorCubrir;
            totalAnomaliasTotalesPorSolventarGlobal += suc.anomaliasTotalesPorSolventar;
        }
        
        const anomaliasT = totalAnomaliasGlobal + totalAnomaliasDesembolsoGlobal
        return {
            sucursales: Array.from(sucursalesMap.values()),
            totalSolicitudesGlobal,
            totalCorrectasGlobal,
            pctCorrectasGlobal: totalSolicitudesGlobal ? Math.round((totalCorrectasGlobal / totalSolicitudesGlobal) * 100) : 0,
            totalDeficientesGlobal,
            pctDeficientesGlobal: totalSolicitudesGlobal ? Math.round((totalDeficientesGlobal / totalSolicitudesGlobal) * 100) : 0,
            totalPendientesGlobal,
            pctPendientesGlobal: totalSolicitudesGlobal ? Math.round((totalPendientesGlobal / totalSolicitudesGlobal) * 100) : 0,
            totalAnomaliasGlobal,
            totalSolventadasGlobal,
            pctSolventadasGlobal: totalAnomaliasGlobal ? Math.round((totalSolventadasGlobal / totalAnomaliasGlobal) * 100) : 0,
            totalNoSolventadasGlobal,
            pctNoSolventadasGlobal: totalAnomaliasGlobal ? Math.round((totalNoSolventadasGlobal / totalAnomaliasGlobal) * 100) : 0,
            totalAnomaliasDesembolsoGlobal,
            totalSolventadasDesembolsoGlobal,
            pctSolventadasDesembolsoGlobal: totalAnomaliasDesembolsoGlobal ? Math.round((totalSolventadasDesembolsoGlobal / totalAnomaliasDesembolsoGlobal) * 100) : 0,
            totalNoSolventadasDesembolsoGlobal,
            pctNoSolventadasDesembolsoGlobal: totalAnomaliasDesembolsoGlobal ? Math.round((totalNoSolventadasDesembolsoGlobal / totalAnomaliasDesembolsoGlobal) * 100) : 0,
            totalPendientesF3Global,
            totalPendientesSolventadosGlobal,
            totalPendientesPorCubrirGlobal,
            totalAnomaliasTotalesPorSolventarGlobal,
            pctTotalAnomaliasTotalesPorSolventarGlobal: anomaliasT ? Math.round((totalAnomaliasTotalesPorSolventarGlobal / anomaliasT) * 100) : 0,
        };
    }

    // TODO: ACTUALIZAR SCHEMA EN FRONTEND Y PLAYGROUND

}