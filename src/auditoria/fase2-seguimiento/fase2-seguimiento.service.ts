import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateFase2SeguimientoInput } from './dto/inputs/credito/create-fase2-seguimiento.input';

@Injectable()
export class Fase2SeguimientoService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('Fase2SeguimientoService')

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Base de datos conectada');
    }

    async createOrUpdateFase2(input: CreateFase2SeguimientoInput, user: Usuario): Promise<{ success: boolean; message?: string }> {
        const { id, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
                // 1. Eliminar evaluaciones y resumen previos
                await tx.a05EvaluacionFase2AuditoriaC.deleteMany({
                    where: { A05CSId: id, creditoSeleccion: { sucursal: { R11Coop_id: user.R12Coop_id } } },
                });

                await tx.a06EvaluacionResumenFase2.deleteMany({
                    where: { A06Id: id, creditoSeleccion: { sucursal: { R11Coop_id: user.R12Coop_id } } },
                });

                if (!evaluaciones || evaluaciones.length === 0) {
                    throw new Error("Debe registrar al menos una evaluación en Fase 2");
                }

                // 2. Insertar nuevas evaluaciones
                await tx.a05EvaluacionFase2AuditoriaC.createMany({
                    data: evaluaciones.map((ev) => ({
                        A05Id: crypto.randomUUID(),
                        A05CSId: id,
                        A05E_id: ev.A05E_id,
                        A05Res: ev.A05Res,
                    })),
                });

                // 4. Insertar resumen con fecha generada automáticamente
                await tx.a06EvaluacionResumenFase2.create({
                    data: {
                        A06Id: id,
                        A06FSeg: new Date().toISOString(),
                        ...resumen,
                    },
                });

                await tx.a02MuestraCreditoSeleccion.update({
                    where: { A02Id: id },
                    data: {
                        A02Estado: "Con seguimiento",
                    }
                })

                return { id }
            });

            return { success: true, ...result };
        } catch (error) {
            this.logger.error("[createOrUpdateFase2] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 2" };
        }
    }

}
