import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { PrismaClient } from "@prisma/client";

import { Usuario } from "src/common/entities/usuario.entity";
import { ReporteFase2Response, ReporteFase2Sucursal } from "../dto/fase2/resultados-seguimiento.dto";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { Calificativo } from "src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum";
import { NATS_SERVICE } from "src/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ReporteFase2Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReportesFase2Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    constructor(
        @Inject(NATS_SERVICE) private readonly _client: ClientProxy
    ) {
        super()
    }

    async getResultadosSeguimiento(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase2Response> {

        const { fechaInicio, fechaFinal } = input;

        const sucursales = await firstValueFrom(
            this._client.send('config.sucursales.getAll', { user })
        );

        const solicitudesF2 = await this.r08EvaluacionResumenFase2.findMany({
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
                    },
                },
            },
        });

        let resultadoSucursales: ReporteFase2Sucursal[] = [];

        for (const sucursal of sucursales) {
            const solicitudesSucursal = solicitudesF2.filter(s => s.prestamo.R01Suc_id === sucursal.R11Id);

            const numSolicitudes = solicitudesSucursal.length;

            const correctas = solicitudesSucursal.filter(s => s.prestamo.resumenF1?.R06Cal === Calificativo.CORRECTO).length;
            const deficientes = solicitudesSucursal.filter(s => s.prestamo.resumenF1?.R06Cal === Calificativo.DEFICIENTE).length;
            const aceptables = solicitudesSucursal.filter(s => s.prestamo.resumenF1?.R06Cal === Calificativo.ACEPTABLE).length;

            const solventadas = solicitudesSucursal.filter(s => s.R08Cal === Calificativo.CORRECTO).length;
            const noSolventadas = solicitudesSucursal.filter(s => s.R08Cal === Calificativo.DEFICIENTE).length;

            const hallazgosNum = solicitudesSucursal.reduce((acc, s) => {
                const r1 = s.prestamo.resumenF1;
                return acc + ((r1?.R06Ha ?? 0) + (r1?.R06Hm ?? 0) + (r1?.R06Hb ?? 0));
            }, 0);

            const hallazgosSolventadas = solicitudesSucursal.reduce((acc, s) => acc + (s.R08SolvT ?? 0), 0);
            const hallazgosNoSolventadas = hallazgosNum - hallazgosSolventadas;

            resultadoSucursales.push({
                sucursal: sucursal.R11Nom,
                solicitudesNum: numSolicitudes,
                correctas,
                correctasPct: numSolicitudes ? Math.round((correctas / numSolicitudes) * 100) : 0,
                deficientes,
                deficientesPct: numSolicitudes ? Math.round((deficientes / numSolicitudes) * 100) : 0,
                aceptables,
                aceptablesPct: numSolicitudes ? Math.round((aceptables / numSolicitudes) * 100) : 0,
                solventadas,
                solventadasPct: numSolicitudes ? Math.round((solventadas / numSolicitudes) * 100) : 0,
                noSolventadas,
                noSolventadasPct: numSolicitudes ? Math.round((noSolventadas / numSolicitudes) * 100) : 0,
                hallazgosNum,
                hallazgosSolventadas,
                hallazgosSolventadasPct: hallazgosNum ? Math.round((hallazgosSolventadas / hallazgosNum) * 100) : 0,
                hallazgosNoSolventadas,
                hallazgosNoSolventadasPct: hallazgosNum ? Math.round((hallazgosNoSolventadas / hallazgosNum) * 100) : 0,
            });
        }

        // 🔹 Filtrar sucursales con solicitudes > 0
        resultadoSucursales = resultadoSucursales.filter(s => s.solicitudesNum > 0);

        // Totales globales (ya sin sucursales vacías)
        const totalSolicitudesNum = resultadoSucursales.reduce((a, s) => a + s.solicitudesNum, 0);
        const totalCorrectas = resultadoSucursales.reduce((a, s) => a + s.correctas, 0);
        const totalDeficientes = resultadoSucursales.reduce((a, s) => a + s.deficientes, 0);
        const totalAceptables = resultadoSucursales.reduce((a, s) => a + s.aceptables, 0);
        const totalSolventadas = resultadoSucursales.reduce((a, s) => a + s.solventadas, 0);
        const totalNoSolventadas = resultadoSucursales.reduce((a, s) => a + s.noSolventadas, 0);
        const totalHallazgosNum = resultadoSucursales.reduce((a, s) => a + s.hallazgosNum, 0);
        const totalHallazgosSolventadas = resultadoSucursales.reduce((a, s) => a + s.hallazgosSolventadas, 0);
        const totalHallazgosNoSolventadas = resultadoSucursales.reduce((a, s) => a + s.hallazgosNoSolventadas, 0);

        return {
            sucursales: resultadoSucursales,
            totalSolicitudesNum,
            totalCorrectas,
            totalDeficientes,
            totalAceptables,
            totalSolventadas,
            totalNoSolventadas,
            totalHallazgosNum,
            totalHallazgosSolventadas,
            totalHallazgosNoSolventadas,
            pctCorrectasGlobal: totalSolicitudesNum ? Math.round((totalCorrectas / totalSolicitudesNum) * 100) : 0,
            pctDeficientesGlobal: totalSolicitudesNum ? Math.round((totalDeficientes / totalSolicitudesNum) * 100) : 0,
            pctAceptablesGlobal: totalSolicitudesNum ? Math.round((totalAceptables / totalSolicitudesNum) * 100) : 0,
            pctSolventadasGlobal: totalSolicitudesNum ? Math.round((totalSolventadas / totalSolicitudesNum) * 100) : 0,
            pctNoSolventadasGlobal: totalSolicitudesNum ? Math.round((totalNoSolventadas / totalSolicitudesNum) * 100) : 0,
            pctHallazgosSolventadasGlobal: totalHallazgosNum ? Math.round((totalHallazgosSolventadas / totalHallazgosNum) * 100) : 0,
            pctHallazgosNoSolventadasGlobal: totalHallazgosNum ? Math.round((totalHallazgosNoSolventadas / totalHallazgosNum) * 100) : 0,
        };
    }


}