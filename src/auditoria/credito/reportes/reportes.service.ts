import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReporteFase1ResponseDTO, ReporteFase1SucursalRowDTO } from './dto/output/fase1/acredito-reporte-fase1-response.output';
import { Usuario } from 'src/common/entities/usuario.entity';

@Injectable()
export class ReportesService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReportesFase1Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    // * FASE 1
    public async getReporteFase1ByMuestra(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteFase1ResponseDTO> {

        const registros = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                resumenRevisionF1: { isNot: null },
                sucursal: { R11Coop_id: user.R12Coop_id }
            },
            select: {
                A02Sucursal: true,
                sucursal: {
                    select: { R11Nom: true }
                },
                resumenRevisionF1: {
                    select: {
                        A04CalA: true,
                        A04CalB: true
                    }
                }
            }
        });

        const mapa = new Map<string, ReporteFase1SucursalRowDTO>();

        for (const r of registros) {
            const sucursal = r.sucursal.R11Nom;

            if (!mapa.has(sucursal)) {
                mapa.set(sucursal, {
                    sucursal,
                    expedientesRevisados: 0,
                    correctos: 0,
                    deficientes: 0,
                    cumplimiento: 0,
                    incumplimiento: 0,
                    aceptables: 0,
                    graves: 0
                });
            }

            const row = mapa.get(sucursal)!;

            row.expedientesRevisados++;

            if (r.resumenRevisionF1?.A04CalA === 'CORRECTO') {
                row.correctos++;
            }

            if (r.resumenRevisionF1?.A04CalA === 'DEFICIENTE') {
                row.deficientes++;
            }

            if (r.resumenRevisionF1?.A04CalB === 'ACEPTABLE') {
                row.aceptables++;
            }

            if (r.resumenRevisionF1?.A04CalB === 'GRAVE') {
                row.graves++;
            }
        }

        // Cálculo de porcentajes por sucursal
        const rows = Array.from(mapa.values()).map(r => ({
            ...r,
            cumplimiento: r.expedientesRevisados
                ? +(r.correctos / r.expedientesRevisados * 100).toFixed(2)
                : 0,
            incumplimiento: r.expedientesRevisados
                ? +(r.deficientes / r.expedientesRevisados * 100).toFixed(2)
                : 0
        }));

        // Totales
        const totales = rows.reduce((acc, r) => {
            acc.expedientesRevisados += r.expedientesRevisados;
            acc.correctos += r.correctos;
            acc.deficientes += r.deficientes;
            acc.aceptables += r.aceptables;
            acc.graves += r.graves;
            return acc;
        }, {
            expedientesRevisados: 0,
            correctos: 0,
            deficientes: 0,
            cumplimiento: 0,
            incumplimiento: 0,
            aceptables: 0,
            graves: 0
        });

        totales.cumplimiento = totales.expedientesRevisados
            ? +(totales.correctos / totales.expedientesRevisados * 100).toFixed(2)
            : 0;

        totales.incumplimiento = totales.expedientesRevisados
            ? +(totales.deficientes / totales.expedientesRevisados * 100).toFixed(2)
            : 0;

        return { rows, totales };
    }

}
