import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateSisconcapEvaluacionResumenFase1Input } from '../fase1-registro/resumen-fase1/dto/inputs/create-sisconcap-resumen-fase1.input';
import { CreateMovimientoInput } from './dto/inputs/create-movimiento.input';
import { CreateSisconcapEvaluacionFase1Input } from '../fase1-registro/evaluacion-fase1/dto/inputs/create-sisconcap-evaluacion-fase1.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { Movimiento } from './entities/movimiento.entity';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { UpdateMovimientoArgs } from './dto/inputs/update-movimiento.input';

@Injectable()
export class MovimientosService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('MovimientosService');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Base de datos conectada');
    }

    async createFase1(
        movimientoInput: CreateMovimientoInput,
        evaluacionesInput: CreateSisconcapEvaluacionFase1Input[],
        resumenInput: CreateSisconcapEvaluacionResumenFase1Input,
        user: Usuario,
    ) {
        try {

            const { R19Nom, ...rest } = movimientoInput

            const result = await this.$transaction(async (tx) => {
                // 1. Crear movimiento
                const movimiento = await tx.r19Movimientos.create({
                    data: {
                        R19Nom: R19Nom.toUpperCase(),
                        ...rest
                    },
                });

                // 2. Crear evaluaciones asociadas al movimiento
                const evaluaciones = evaluacionesInput.map((ev) => ({
                    ...ev,
                    R20Folio: movimiento.R19Folio,
                }));

                await tx.r20EvaluacionFase1Sisconcap.createMany({
                    data: evaluaciones,
                });

                // 3. Crear resumen asociado al movimiento
                const resumen = await tx.r21EvaluacionResumenFase1.create({
                    data: {
                        ...resumenInput,
                        R21SP_id: user.R12Id,
                        R21Folio: movimiento.R19Folio,
                    },
                });

                return {
                    movimiento,
                    evaluaciones,
                    resumen,
                };
            });

            return result;

        } catch (error) {
            this.logger.error('❌ Error en la transacción de creación de Fase 1:', error);
            throw new RpcException({
                message: 'No se pudo crear la Fase 1 (movimiento, evaluaciones y resumen)',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async findAll( user: Usuario, filterBySucursal: boolean = true ): Promise<Movimiento[]> {

        // Base del filtro: siempre filtra por cooperativa
        const where: any = {
            R19Coop_id: user.R12Coop_id
        };

        // Si la bandera está activa, también filtra por sucursal
        if (filterBySucursal) {
            where.R19Suc_id = user.R12Suc_id;
        }

        const movimientos = await this.r19Movimientos.findMany({
            where,
            include: {
                sucursal: true,
                evaluacionResumenFase1: {
                    include: {
                        ejecutivo: true,
                        supervisor: true,
                    }
                }
            },
            orderBy: {
                R19Creado_en: 'desc'
            }
        })

        return movimientos.map( mov => ({
            ...mov,
            evaluacionResumenFase1: mov.evaluacionResumenFase1 ?? undefined,
        }))
    }

    async findByFolio(folio: number, user: Usuario): Promise<Movimiento> {
        const movimiento = await this.r19Movimientos.findUnique({
            where: {
                R19Folio: folio,
                R19Coop_id: user.R12Coop_id,
            },
            include: {
                evaluacionFase1: true,
                evaluacionResumenFase1: {
                    include: {
                        ejecutivo: true,
                        supervisor: true,
                    }
                }
            }
        })

        if (!movimiento) {
            throw new RpcException({
                message: `Movimiento con folio ${folio} no encontrado`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        // return movimiento
        return {
            ...movimiento,
            evaluacionResumenFase1: movimiento.evaluacionResumenFase1 ?? undefined,
        }
    }

    async updateFase1( input: UpdateMovimientoArgs, user: Usuario ): Promise<BooleanResponse> {
        const { movimiento, evaluaciones, resumen, folio } = input;

        try {
            await this.$transaction(async (tx) => {
                // 1. Verificar que el movimiento exista y pertenezca a la misma cooperativa
                const exists = await tx.r19Movimientos.findFirst({
                    where: {
                        R19Folio: folio,
                        R19Coop_id: user.R12Coop_id,
                    },
                });

                if (!exists) {
                    throw new Error(
                        `No se encontró el movimiento con folio ${folio} en esta cooperativa`,
                    );
                }

                // 2. Actualizar el movimiento
                await tx.r19Movimientos.update({
                    where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                    data: {
                        ...movimiento,
                    },
                });

                // 3. Eliminar evaluaciones anteriores
                await tx.r20EvaluacionFase1Sisconcap.deleteMany({
                    where: {
                        R20Folio: folio,
                        movimiento: { R19Coop_id: user.R12Coop_id }
                    },
                });

                // 4. Crear las nuevas evaluaciones
                if (evaluaciones?.length) {
                    await tx.r20EvaluacionFase1Sisconcap.createMany({
                        data: evaluaciones.map((ev) => ({
                            ...ev,
                            R20Folio: folio,
                        })),
                    });
                }

                // 5. Actualizar resumen
                const existingResumen = await tx.r21EvaluacionResumenFase1.findUnique({
                    where: { R21Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
                });

                if (!existingResumen) {
                    throw new Error(`No existe resumen para el folio ${folio}, no se puede actualizar`);
                }

                await tx.r21EvaluacionResumenFase1.update({
                    where: { R21Folio: folio },
                    data: {
                        ...resumen,
                        R21SP_id: user.R12Id,
                    },
                });

            });

            return { success: true };
        } catch (error) {
            this.logger.error('❌ Error en updateFase1:', error);
            return {
                success: false,
                message: error.message || 'No se pudo actualizar el movimiento',
            };
        }
    }

    async remove(folio: number, user: Usuario): Promise<Movimiento> {
        await this.findByFolio(folio, user)

        return await this.r19Movimientos.delete({ where: { R19Folio: folio } })
    }

}
