import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionResumenFase2 } from './entities/evaluacion-resumen-fase2.entity';
import { CreateEvaluacionResumenFase2Input } from './dto/inputs/create-evaluacion-resumen-fase2.input';
import { UpdateEvaluacionResumenFase2Input } from './dto/inputs/update-evaluacion-resumen-fase2.input';

@Injectable()
export class ResumenFase2Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ResumenFase2Service');

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Base de datos conectada');
    }

    async create(data: CreateEvaluacionResumenFase2Input, user: Usuario): Promise<EvaluacionResumenFase2> {
        const exists = await this.r08EvaluacionResumenFase2.findFirst({
            where: {
                R08P_num: data.R08P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                },
            },
        });

        if (exists) {
            throw new RpcException({
            message: `Ya existe un resumen de evaluación para el préstamo ${data.R08P_num} en fase 2`,
            status: HttpStatus.BAD_REQUEST,
            });
        }

        const resumen = await this.r08EvaluacionResumenFase2.create({ 
            data: {
                R08FSeg: new Date().toISOString(),
                ...data
            }
        })

        return resumen
    }

    async findAll(user: Usuario): Promise<EvaluacionResumenFase2[]> {
        return await this.r08EvaluacionResumenFase2.findMany({
            where: {
                prestamo: {
                    R01Activ: true,
                    R01Coop_id: user.R12Coop_id,
                },
            },
            include: {
                prestamo: true,
            },
        });
    }

    async findOne(R08P_num: string, user: Usuario): Promise<EvaluacionResumenFase2> {
        const resumen = await this.r08EvaluacionResumenFase2.findUnique({
            where: { 
                R08P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                },
            },
            include: {
                prestamo: true,
            },
        });

        if (!resumen || resumen.prestamo.R01Coop_id !== user.R12Coop_id) {
            throw new RpcException({
                message: `Resumen de evaluación con número de préstamo ${R08P_num} no existe`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return resumen;
    }

    async update(R08P_num: string, data: UpdateEvaluacionResumenFase2Input, user: Usuario): Promise<EvaluacionResumenFase2> {
        const exists = await this.findOne(R08P_num, user);

        if (!exists) {
            throw new RpcException({
                message: `No se puede actualizar. El resumen con número ${R08P_num} no existe.`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return await this.r08EvaluacionResumenFase2.update({
            where: { R08P_num },
            data,
        });
    }

    async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
        try {
            await this.r08EvaluacionResumenFase2.delete({
                where: { R08P_num: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } }
            });

            return true;
        } catch (error) {
            // Si no existe, no lanza error
            throw new RpcException({
                message: 'No se pudieron eliminar el resumen anterior',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
