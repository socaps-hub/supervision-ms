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
import { CreateFase2Input } from './dto/inputs/create-fase2.input';
import { ValidEstados } from 'src/fase-i-levantamiento/solicitudes/enums/valid-estados.enum';
import { CreateFase3Input } from './dto/inputs/create-fase3.input';

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

    async createOrUpdateFase2(
        input: CreateFase2Input,
        user: Usuario
    ): Promise<{ success: boolean; message?: string }> {
        const { folio, evaluaciones, resumen } = input;

        try {
        await this.$transaction(async (tx) => {
            // 1. Eliminar evaluaciones y resumen previos
            await tx.r22EvaluacionFase2Sisconcap.deleteMany({
                where: { R22Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
            });

            await tx.r23EvaluacionResumenFase2.deleteMany({
                where: { R23Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
            });

            if (!evaluaciones || evaluaciones.length === 0) {
                throw new Error("Debe registrar al menos una evaluación en Fase 2");
            }

            // 2. Insertar nuevas evaluaciones
            await tx.r22EvaluacionFase2Sisconcap.createMany({
                data: evaluaciones.map((ev) => ({
                    R22Id: crypto.randomUUID(),
                    R22Folio: folio,
                    R22E_id: ev.R22E_id,
                    R22Res: ev.R22Res,
                })),
            });

            // 3. Insertar resumen con fecha generada automáticamente
            await tx.r23EvaluacionResumenFase2.create({
                data: {
                    R23Folio: folio,
                    R23Solv: resumen.R23Solv,
                    R23PSolv: resumen.R23PSolv,
                    R23Rc: resumen.R23Rc,
                    R23Obs: resumen.R23Obs?.trim() || '',
                    R23Cal: resumen.R23Cal,
                    R23FSeg: resumen.R23FSeg,
                    R23SP_id: user.R12Id,
                },            
            });

            // 4. Actualizar Estado del movimiento a "Con seguimiento"
            await tx.r19Movimientos.update({
                where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                data: {
                    R19Est: "Con seguimiento",
                }
            })
        });

            return { success: true };
        } catch (error) {
            this.logger.error("[createOrUpdateFase2] Error:", error);
            // return { success: false, message: error.message || "Error en Fase 2" };
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 2" };
        }
    }

    async createOrUpdateFase3(
        input: CreateFase3Input,
        user: Usuario
    ): Promise<{ success: boolean; message?: string }> {
        const { folio, evaluaciones, resumen } = input;

        try {
        await this.$transaction(async (tx) => {
            // 1. Eliminar evaluaciones y resumen previos
            await tx.r24EvaluacionFase3Sisconcap.deleteMany({
                where: { R24Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
            });

            await tx.r25EvaluacionResumenFase3.deleteMany({
                where: { R25Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
            });

            if (!evaluaciones || evaluaciones.length === 0) {
                throw new Error("Debe registrar al menos una evaluación en Fase 2");
            }

            // 2. Insertar nuevas evaluaciones
            await tx.r24EvaluacionFase3Sisconcap.createMany({
                data: evaluaciones.map((ev) => ({
                    R24Id: crypto.randomUUID(),
                    R24Folio: folio,
                    R24E_id: ev.R24E_id,
                    R24Res: ev.R24Res,
                })),
            });

            // 3. Insertar resumen con fecha generada automáticamente
            await tx.r25EvaluacionResumenFase3.create({
                data: {
                    R25Folio: folio,
                    R25Solv: resumen.R25Solv,
                    R25PSolv: resumen.R25PSolv,
                    R25Rc: resumen.R25Rc,
                    R25Obs: resumen.R25Obs?.trim() || '',
                    R25Cal: resumen.R25Cal,
                    R25FSegG: resumen.R25FSegG,
                    R25SP_id: user.R12Id,
                },            
            });

            // 4. Actualizar Estado del movimiento a "Con seguimiento"
            await tx.r19Movimientos.update({
                where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                data: {
                    R19Est: "Con global",
                }
            })
        });

            return { success: true };
        } catch (error) {
            this.logger.error("[createOrUpdateFase3] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 3" };
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

    async findByEstado(estado: ValidEstados, user: Usuario, filterBySucursal: boolean = true): Promise<Movimiento[]> {
        const estadosValidos = [
            'Con seguimiento',
            'Sin seguimiento',
            'Con global',
        ];

        if (!estadosValidos.includes(estado)) {
            throw new RpcException({
                message: `Estado ${estado} no es válido.`,
                status: HttpStatus.BAD_REQUEST,
            });
        }

        // Base del filtro: siempre filtra por cooperativa y activo
        const where: any = {
            R19Coop_id: user.R12Coop_id,
            R19Est: estado,
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
                        supervisor: true,
                        ejecutivo: true,
                    }
                },
                evaluacionResumenFase2: {
                    include: {
                        supervisor: true,
                    }
                },
                evaluacionResumenFase3: {
                    include: {
                        supervisor: true,
                    }
                },
            },
            orderBy: {
                R19Creado_en: 'desc',
            },
        });

        return movimientos.map( mov => ({
            ...mov,
            evaluacionResumenFase1: mov.evaluacionResumenFase1 ?? undefined,
            evaluacionResumenFase2: mov.evaluacionResumenFase2 ?? undefined,
            evaluacionResumenFase3: mov.evaluacionResumenFase3 ?? undefined,
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
                evaluacionFase2: true,
                evaluacionFase3: true,
                evaluacionResumenFase1: {
                    include: {
                        ejecutivo: true,
                        supervisor: true,
                    }
                },
                evaluacionResumenFase2: {
                    include: {
                        supervisor: true,
                    }
                },
                evaluacionResumenFase3: {
                    include: {
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
            evaluacionResumenFase2: movimiento.evaluacionResumenFase2 ?? undefined,
            evaluacionResumenFase3: movimiento.evaluacionResumenFase3 ?? undefined,
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
