import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Calificativo, PrismaClient } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import { Usuario } from "src/common/entities/usuario.entity";

import { NATS_SERVICE } from "src/config";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ReporteFase3Response, ReporteFase3Sucursal } from "../dto/fase3/revision-desembolsos.dto";
import { DetalleAnomaliasF3Response, SucursalDetalleDto } from "../dto/fase3/anomalias-desembolso.dto";
import { normalizeToYYYYMMDD } from "src/common/utils/date.util";

@Injectable()
export class ReporteFase3Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReporteFase3Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    constructor(
        @Inject(NATS_SERVICE) private readonly _client: ClientProxy
    ) {
        super()
    }

    async getRevisionDesembolsos(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase3Response> {
        const fechaInicio = normalizeToYYYYMMDD(input.fechaInicio);
        const fechaFinal  = normalizeToYYYYMMDD(input.fechaFinal);   

        // Obtener sucursales disponibles para el usuario
        const sucursales = await firstValueFrom(
            this._client.send('config.sucursales.getAll', { user })
        );

        // Obtener todos los registros de Fase 3 en el rango de fechas
        const solicitudesF3 = await this.r10EvaluacionResumenFase3.findMany({
            where: {
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                    R01FRec: {
                        gte: fechaInicio,
                        lte: fechaFinal,
                    },
                },
            },
            include: {
                prestamo: {
                    include: {
                        sucursal: true,
                    },
                },
            },
        });

        let resultadoSucursales: ReporteFase3Sucursal[] = [];

        for (const sucursal of sucursales) {
            const solicitudesSucursal = solicitudesF3.filter(s => s.prestamo.R01Suc_id === sucursal.R11Id);

            const numSolicitudes = solicitudesSucursal.length;

            const correctas = solicitudesSucursal.filter(s => s.R10Cal === Calificativo.CORRECTO).length;
            const deficientes = solicitudesSucursal.filter(s => s.R10Cal === Calificativo.DEFICIENTE).length;
            const pendientes = solicitudesSucursal.filter(s => s.R10Cal === Calificativo.PENDIENTE).length;

            const hallazgosNum = solicitudesSucursal.reduce((acc, s) => acc + (s.R10Ha ?? 0), 0);
            const hallazgosPendientes = solicitudesSucursal.reduce((acc, s) => acc + (s.R10Pendientes ?? 0), 0);

            resultadoSucursales.push({
                sucursal: sucursal.R11Nom,
                solicitudesNum: numSolicitudes,
                correctas,
                correctasPct: numSolicitudes ? Math.round((correctas / numSolicitudes) * 100) : 0,
                deficientes,
                deficientesPct: numSolicitudes ? Math.round((deficientes / numSolicitudes) * 100) : 0,
                pendientes,
                pendientesPct: numSolicitudes ? Math.round((pendientes / numSolicitudes) * 100) : 0,
                hallazgosNum,
                hallazgosPendientes,
            });
        }

        // 🔹 Filtrar sucursales con solicitudes > 0
        resultadoSucursales = resultadoSucursales.filter(s => s.solicitudesNum > 0);

        // Totales globales
        const totalSolicitudesNum = resultadoSucursales.reduce((a, s) => a + s.solicitudesNum, 0);
        const totalCorrectas = resultadoSucursales.reduce((a, s) => a + s.correctas, 0);
        const totalDeficientes = resultadoSucursales.reduce((a, s) => a + s.deficientes, 0);
        const totalPendientes = resultadoSucursales.reduce((a, s) => a + s.pendientes, 0);
        const totalHallazgosNum = resultadoSucursales.reduce((a, s) => a + s.hallazgosNum, 0);
        const totalHallazgosPendientes = resultadoSucursales.reduce((a, s) => a + s.hallazgosPendientes, 0);

        return {
            sucursales: resultadoSucursales,
            totalSolicitudesNum,
            totalCorrectas,
            totalDeficientes,
            totalPendientes,
            totalHallazgosNum,
            totalHallazgosPendientes,
            pctCorrectasGlobal: totalSolicitudesNum ? Math.round((totalCorrectas / totalSolicitudesNum) * 100) : 0,
            pctDeficientesGlobal: totalSolicitudesNum ? Math.round((totalDeficientes / totalSolicitudesNum) * 100) : 0,
            pctPendientesGlobal: totalSolicitudesNum ? Math.round((totalPendientes / totalSolicitudesNum) * 100) : 0,
        };
    }

    async getDetalleAnomaliasF3(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasF3Response> {
        const fechaInicio = normalizeToYYYYMMDD(input.fechaInicio);
        const fechaFinal  = normalizeToYYYYMMDD(input.fechaFinal);   

        // 1️⃣ Obtener rubros y elementos del grupo "Desembolso"
        const rubros = await this.r03Rubro.findMany({
            where: {
                grupo: {
                    R02Nom: 'Desembolso',
                    R02Coop_id: user.R12Coop_id,
                }
            },
            include: {
                elementos: {
                    select: {
                        R04Nom: true,
                        R04Imp: true,
                    },
                },
            },
        });

        const rubrosBaseMap = new Map<string, Map<string, string>>();
        for (const r of rubros) {
            if (!rubrosBaseMap.has(r.R03Nom)) {
                rubrosBaseMap.set(r.R03Nom, new Map());
            }
            for (const e of r.elementos) {
                rubrosBaseMap.get(r.R03Nom)!.set(e.R04Nom, e.R04Imp);
            }
        }

        // 2️⃣ Traer solicitudes fase 3 y evaluaciones con resultado "I"
        const solicitudes = await this.r01Prestamo.findMany({
            where: {
                R01FRec: {
                    gte: fechaInicio,
                    lte: fechaFinal,
                },
                R01Coop_id: user.R12Coop_id,
            },
            include: {
                sucursal: true,
                ejecutivo: true,
                evaluacionesF3: {
                    where: { R09Res: 'I' },
                    include: {
                        elemento: {
                            select: {
                                R04Nom: true,
                                R04Imp: true,
                                rubro: { select: { R03Nom: true } }
                            }
                        }
                    }
                },
                resumenF3: {
                    include: {
                        evaluador: true
                    }
                }
            }
        });

        let totalIncorrectosGlobal = 0;
        const sucursalesMap = new Map<string, SucursalDetalleDto>();

        // 3️⃣ Recorrer solicitudes
        for (const solicitud of solicitudes) {
            const sucId = solicitud.sucursal?.R11NumSuc ?? 0;
            const sucNom = solicitud.sucursal?.R11Nom ?? 'Desconocida';

            // Inicializar sucursal si no existe
            if (!sucursalesMap.has(sucId)) {
                sucursalesMap.set(sucId, {
                    id: sucId,
                    nombre: sucNom,
                    totalSolicitudes: 0,
                    totalIncorrectos: 0,
                    rubros: Array.from(rubrosBaseMap.entries()).map(([rubro, elementos]) => ({
                        rubro,
                        total: 0,
                        porcentaje: 0,
                        elementos: Array.from(elementos.entries()).map(([elemento, impacto]) => ({
                            elemento,
                            impacto,
                            total: 0
                        }))
                    })),
                    ejecutivos: []
                });
            }

            const sucursal = sucursalesMap.get(sucId)!;
            sucursal.totalSolicitudes++;

            // Inicializar ejecutivo
            const ejeId = solicitud.resumenF3?.evaluador.R12Id ?? '0';
            const ejeNom = solicitud.resumenF3?.evaluador.R12Nom ?? 'Sin asignar';
            let ejecutivo = sucursal.ejecutivos.find(e => e.id === ejeId);
            if (!ejecutivo) {
                ejecutivo = {
                    id: ejeId,
                    nombre: ejeNom,
                    totalSolicitudes: 0,
                    totalIncorrectos: 0,
                    rubros: JSON.parse(JSON.stringify(sucursal.rubros)) // copia profunda
                };
                sucursal.ejecutivos.push(ejecutivo);
            }
            ejecutivo.totalSolicitudes++;

            // Recorrer evaluaciones incorrectas
            for (const ev of solicitud.evaluacionesF3) {
                const rubroNombre = ev.elemento?.rubro?.R03Nom;
                const elementoNombre = ev.elemento?.R04Nom;
                if (!rubroNombre || !elementoNombre) continue;

                // Sucursal rubros
                const rubroSuc = sucursal.rubros.find(r => r.rubro === rubroNombre);
                const elemSuc = rubroSuc?.elementos.find(e => e.elemento === elementoNombre);
                if (elemSuc) {
                    elemSuc.total++;
                    rubroSuc!.total++;
                }

                // Ejecutivo rubros
                const rubroEje = ejecutivo.rubros.find(r => r.rubro === rubroNombre);
                const elemEje = rubroEje?.elementos.find(e => e.elemento === elementoNombre);
                if (elemEje) {
                    elemEje.total++;
                    rubroEje!.total++;
                }

                sucursal.totalIncorrectos++;
                ejecutivo.totalIncorrectos++;
                totalIncorrectosGlobal++;
            }
        }

        // 4️⃣ Calcular porcentajes
        for (const suc of sucursalesMap.values()) {
            for (const rubro of suc.rubros) {
                rubro.porcentaje = totalIncorrectosGlobal > 0
                    ? Math.round((rubro.total / totalIncorrectosGlobal) * 100)
                    : 0;
            }
            // Filtrar ejecutivos que tengan todo 0
            suc.ejecutivos = suc.ejecutivos.filter(e => e.totalSolicitudes > 0 && e.totalIncorrectos > 0);
        }

        // 5️⃣ Filtrar sucursales con totalIncorrectos <= 0
        const sucursalesFiltradas = Array.from(sucursalesMap.values())
            .filter(s => s.totalIncorrectos > 0);

        return {
            totalSolicitudesGlobal: solicitudes.length,
            totalIncorrectosGlobal,
            sucursales: sucursalesFiltradas
        };
    }


}