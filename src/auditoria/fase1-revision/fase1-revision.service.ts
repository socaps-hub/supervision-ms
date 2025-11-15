import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateFase1RevisionInput } from './dto/inputs/credito/create-fase1-revision.input';

@Injectable()
export class Fase1RevisionService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('Fase1RevisionService')

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Base de datos conectada');
    }

    async createOrUpdateFase1( input: CreateFase1RevisionInput, user: Usuario ): Promise<{ success: boolean; message?: string }> {
        const { id, evaluaciones, resumen } = input;

        try {
            await this.$transaction(async (tx) => {
                // 1. Eliminar evaluaciones y resumen previos
                await tx.a03EvaluacionFase1AuditoriaC.deleteMany({
                    where: { A03CSId: id, creditoSeleccion: { sucursal: { R11Coop_id: user.R12Coop_id } } },
                });

                await tx.a04EvaluacionResumenFase1.deleteMany({
                    where: { A04Id: id, creditoSeleccion: { sucursal: { R11Coop_id: user.R12Coop_id } } },
                });

                if (!evaluaciones || evaluaciones.length === 0) {
                    throw new Error("Debe registrar al menos una evaluación en Fase 1");
                }

                // 2. Insertar nuevas evaluaciones
                await tx.a03EvaluacionFase1AuditoriaC.createMany({
                    data: evaluaciones.map((ev) => ({
                        A03Id: crypto.randomUUID(),
                        A03CSId: id,
                        A03E_id: ev.A03E_id,
                        A03Res: ev.A03Res,
                    })),
                });

                // 3. Buscar id del ejecutivo responsable
                const ejecutivo = await tx.r12Usuario.findFirst({
                    where: { R12Ni: resumen.A04Resp, R12Coop_id: user.R12Coop_id },
                    select: { R12Id: true }
                })

                if ( !ejecutivo ) {
                    throw new Error("Ejecutivo responsable no encontrado");
                }

                // 4. Insertar resumen con fecha generada automáticamente
                await tx.a04EvaluacionResumenFase1.create({
                    data: {
                        A04Id: id,
                        A04PSAut: resumen.A04PSAut,
                        A04Excep: resumen.A04Excep,
                        A04Ha: resumen.A04Ha,
                        A04MonR: resumen.A04MonR,
                        A04PRes: resumen.A04PRes,
                        A04CalA: resumen.A04CalA,
                        A04CalB: resumen.A04CalB,
                        A04Obs: resumen.A04Obs,
                        A04Comp: resumen.A04Comp,
                        A04FPlzo: resumen.A04FPlzo,
                        A04Resp: ejecutivo.R12Id,
                        A04Aud_id: resumen.A04Aud_id,
                        A04FRev: new Date().toISOString(),
                    },
                });

                // TODO 5. Actualizar Estado del movimiento a "Con seguimiento"
                await tx.a02MuestraCreditoSeleccion.update({
                    where: { A02Id: id },
                    data: {
                        A02Estado: "Con revision",
                    }
                })
            });

            return { success: true };
        } catch (error) {
            this.logger.error("[createOrUpdateFase1] Error:", error);
            // return { success: false, message: error.message || "Error en Fase 2" };
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 1" };
        }
    }

}
