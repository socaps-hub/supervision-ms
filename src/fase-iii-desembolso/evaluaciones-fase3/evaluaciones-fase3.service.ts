import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, ResFaseIII } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionFase3 } from './entities/evaluacion-fase3.entity';
import { CreateEvaluacionFase3Input } from './dto/inputs/create-evaluacion-fase3.input';
import { UpdateEvaluacionFase3Input } from './dto/inputs/update-evaluacion-fase3.input';

@Injectable()
export class EvaluacionesFase3Service extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('EvaluacionesFase3Service');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Conexión a base de datos establecida para EvaluacionesFase3');
    }

    async createMany(inputs: CreateEvaluacionFase3Input[], usuario: Usuario): Promise<boolean> {
        try {
            const evaluaciones = inputs.map((input) => ({
                R09Id: crypto.randomUUID(),
                R09P_num: input.R09P_num,
                R09E_id: input.R09E_id,
                R09Res: input.R09Res as ResFaseIII,
                R09Ev_en: new Date().toISOString(),
            }));

            await this.r09EvaluacionFase3.createMany({
                data: evaluaciones,
            });

            return true;
        } catch (error) {
            console.error('❌ Error al crear evaluaciones Fase III:', error);
            throw new RpcException({
                message: 'No se pudieron guardar las evaluaciones Fase III.',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async findAll(prestamoId: string, user: Usuario): Promise<EvaluacionFase3[]> {
        return await this.r09EvaluacionFase3.findMany({
            where: {
                R09P_num: prestamoId,
                prestamo: {
                    R01Coop_id: user.R12Coop_id
                }
            },
            include: {
                elemento: true,
            },
        });
    }

    async update(id: string, input: UpdateEvaluacionFase3Input, user: Usuario): Promise<EvaluacionFase3> {
        const evaluacion = await this.r09EvaluacionFase3.findUnique({ where: { R09Id: id } });

        if (!evaluacion) {
            throw new RpcException({
                message: `Evaluación con ID ${id} no encontrada o no autorizada.`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return await this.r09EvaluacionFase3.update({
            where: { R09Id: id },
            data: {
                R09Res: input.R09Res,
            },
        });
    }

    async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
        try {
            await this.r09EvaluacionFase3.deleteMany({
                where: {
                    R09P_num: prestamoId,
                    prestamo: { R01Coop_id: user.R12Coop_id },
                },
            });
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar evaluaciones Fase III:', error);
            throw new RpcException({
                message: 'No se pudieron eliminar las evaluaciones anteriores',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
