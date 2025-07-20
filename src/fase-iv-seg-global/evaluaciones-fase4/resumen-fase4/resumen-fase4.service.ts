import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { CreateEvaluacionResumenFase4Input } from './dto/inputs/create-evaluacion-resumen-fase4.input';
import { UpdateEvaluacionResumenFase4Input } from './dto/inputs/update-evaluacion-resumen-fase4.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionResumenFase4 } from './entities/resumen-fase4.entity';

@Injectable()
export class ResumenFase4Service extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('ResumenFase4Service');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Base de datos conectada para ResumenFase4Service');
    }

    async create(data: CreateEvaluacionResumenFase4Input, user: Usuario): Promise<EvaluacionResumenFase4> {
        const exists = await this.r16EvaluacionResumenFase4.findFirst({
            where: {
                R16P_num: data.R16P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                },
            },
        });

        if (exists) {
            throw new RpcException({
                message: `Ya existe un resumen de fase 4 para el préstamo ${data.R16P_num} en fase 4`,
                status: HttpStatus.BAD_REQUEST,
            });
        }

        return await this.r16EvaluacionResumenFase4.create({
            data: {
                R16FGlo: new Date().toISOString(),
                ...data
            },
        });
    }

    async findAll(user: Usuario): Promise<EvaluacionResumenFase4[]> {
        return await this.r16EvaluacionResumenFase4.findMany({
            where: {
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                    R01Activ: true,
                },
            },
            include: {
                prestamo: true,
                evaluador: true,
            },
        });
    }

    async findOne(R16P_num: string, user: Usuario): Promise<EvaluacionResumenFase4> {
        const resumen = await this.r16EvaluacionResumenFase4.findFirst({
            where: {
                R16P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id,
                },
            },
            include: {
                prestamo: true,
                evaluador: true,
            },
        });

        if (!resumen) {
            throw new RpcException({
                message: `Resumen de fase 4 con número de préstamo ${R16P_num} no encontrado`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return resumen;
    }

    async update(id: string, data: UpdateEvaluacionResumenFase4Input, user: Usuario): Promise<EvaluacionResumenFase4> {
        const exists = await this.findOne(id, user);

        if (!exists) {
            throw new RpcException({
                message: `No se puede actualizar. El resumen con número ${id} no existe`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return await this.r16EvaluacionResumenFase4.update({
            where: { R16P_num: id },
            data,
        });
    }

    async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
        try {
            await this.r16EvaluacionResumenFase4.delete({
                where: {
                    R16P_num: prestamoId,
                    prestamo: {
                        R01Coop_id: user.R12Coop_id,
                    },
                },
            });

            return true;
        } catch (error) {
            this.logger.error('Error al eliminar resumen fase 4', error);
            throw new RpcException({
                message: 'No se pudo eliminar el resumen de fase 4',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
