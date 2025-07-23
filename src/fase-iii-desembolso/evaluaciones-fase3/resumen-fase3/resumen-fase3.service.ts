import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionResumenFase3 } from './entities/resumen-fase3.entity';
import { CreateEvaluacionResumenFase3Input } from './dtos/inputs/create-resumen-fase3.input';
import { UpdateEvaluacionResumenFase3Input } from './dtos/inputs/update-resumen-fase3.input';

@Injectable()
export class ResumenFase3Service extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('ResumenFase3Service');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Conexión a base de datos establecida para ResumenFase3');
    }

    async create(data: CreateEvaluacionResumenFase3Input, user: Usuario): Promise<EvaluacionResumenFase3> {
        const exists = await this.r10EvaluacionResumenFase3.findFirst({
            where: {
                R10P_num: data.R10P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id
                }
            }
        });

        if (exists) {
            throw new RpcException({
                message: `Ya existe un resumen de evaluación para el préstamo ${data.R10P_num} en fase 3`,
                status: HttpStatus.BAD_REQUEST,
            });
        }

        return await this.r10EvaluacionResumenFase3.create({
            data: {
                R10FDes: new Date().toISOString(),
                R10Sup: user.R12Id,
                ...data
            }
        });
    }

    async findAll(user: Usuario): Promise<EvaluacionResumenFase3[]> {
        return await this.r10EvaluacionResumenFase3.findMany({
            where: {
                prestamo: {
                    R01Activ: true,
                    R01Coop_id: user.R12Coop_id,
                },
            },
            include: {
                prestamo: true,
                evaluador: true,
                supervisor: true,
            },
        });
    }

    async findOne(R10P_num: string, user: Usuario): Promise<EvaluacionResumenFase3> {
        const resumen = await this.r10EvaluacionResumenFase3.findUnique({
            where: {
                R10P_num,
                prestamo: {
                    R01Coop_id: user.R12Coop_id
                }
            },
            include: {
                prestamo: true,
                evaluador: true,
                supervisor: true,
            },
        });

        if (!resumen || resumen.prestamo.R01Coop_id !== user.R12Coop_id) {
            throw new RpcException({
                message: `Resumen de fase 3 con número de préstamo ${R10P_num} no encontrado`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return resumen;
    }

    async update(R10P_num: string, data: UpdateEvaluacionResumenFase3Input, user: Usuario): Promise<EvaluacionResumenFase3> {
        const exists = await this.findOne(R10P_num, user);

        if (!exists) {
            throw new RpcException({
                message: `No se puede actualizar. El resumen con número ${R10P_num} no existe.`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return await this.r10EvaluacionResumenFase3.update({
            where: { R10P_num },
            data,
        });
    }

    async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
        try {
            await this.r10EvaluacionResumenFase3.delete({
                where: {
                    R10P_num: prestamoId,
                    prestamo: {
                        R01Coop_id: user.R12Coop_id
                    }
                },
            });
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar resumen Fase 3:', error);
            throw new RpcException({
                message: 'No se pudo eliminar el resumen de fase 3.',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
