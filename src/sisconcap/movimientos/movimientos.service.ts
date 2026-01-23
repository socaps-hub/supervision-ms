import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Calificativo, PrismaClient, ResFaseII } from '@prisma/client';
import { CreateSisconcapEvaluacionResumenFase1Input } from '../fase1-registro/resumen-fase1/dto/inputs/create-sisconcap-resumen-fase1.input';
import { CreateMovimientoInput } from './dto/inputs/create-movimiento.input';
import { CreateSisconcapEvaluacionFase1Input } from '../fase1-registro/evaluacion-fase1/dto/inputs/create-sisconcap-evaluacion-fase1.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { Movimiento } from './entities/movimiento.entity';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { UpdateMovimientoArgs } from './dto/inputs/update-movimiento.input';
import { CreateFase2Input } from './dto/inputs/create-fase2.input';
import { CreateFase3Input } from './dto/inputs/create-fase3.input';
import { mapPrimeFilterToPrisma } from 'src/common/utils/map-prime-to-prisma.util';
import { InventarioMovimientosResponse } from './dto/output/inventario-movimientos-response.dto';
import { SisconcapFase1StatisticsOutput } from './dto/output/fase1-stats-response.output';
import { InventarioSolicitudesFilterInput } from 'src/sisconcre/solicitudes/dto/inputs/solicitudes/inventario-solicitudes-filter.input';
import { ValidEstados } from 'src/sisconcre/solicitudes/enums/valid-estados.enum';

@Injectable()
export class MovimientosService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('MovimientosService')

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

                // 4. Si el calificativo de fase 1 es CORRECTO -> clonar evaluaciones a fase 2 y 3
                if (resumenInput.R21Cal === Calificativo.CORRECTO) {
                    // Preparar evaluaciones de fase 2 y 3 a partir de las de fase 1
                    const evaluacionesFase2 = evaluaciones.map((ev) => ({
                        R22Folio: movimiento.R19Folio,
                        R22E_id: ev.R20E_id,
                        R22Res: ev.R20Res as ResFaseII,
                    }));

                    const evaluacionesFase3 = evaluaciones.map((ev) => ({
                        R24Folio: movimiento.R19Folio,
                        R24E_id: ev.R20E_id,
                        R24Res: ev.R20Res as ResFaseII,
                    }));

                    // Crear evaluaciones fase 2
                    await tx.r22EvaluacionFase2Sisconcap.createMany({
                        data: evaluacionesFase2,
                    });

                    // Crear resumen fase 2
                    await tx.r23EvaluacionResumenFase2.create({
                        data: {
                            R23Folio: movimiento.R19Folio,
                            R23Solv: 0,
                            R23PSolv: 0,
                            R23Rc: resumenInput.R21Rc,
                            R23Obs: resumenInput.R21Obs || 'PASO AUTOMÁTICO',
                            R23Cal: Calificativo.CORRECTO,
                            R23FSeg: new Date().toISOString(),
                            R23SP_id: user.R12Id,
                        },
                    });

                    // Crear evaluaciones fase 3
                    await tx.r24EvaluacionFase3Sisconcap.createMany({
                        data: evaluacionesFase3,
                    });

                    // Crear resumen fase 3
                    const newResumen = await tx.r25EvaluacionResumenFase3.create({
                        data: {
                            R25Folio: movimiento.R19Folio,
                            R25Solv: 0,
                            R25PSolv: 0,
                            R25Rc: resumenInput.R21Rc,
                            R25Obs: resumenInput.R21Obs || 'PASO AUTOMÁTICO',
                            R25Cal: Calificativo.CORRECTO,
                            R25FSegG: new Date().toISOString(),
                            R25SP_id: user.R12Id,
                        },
                    });

                    await tx.r19Movimientos.update({
                        where: { R19Folio: movimiento.R19Folio, R19Coop_id: user.R12Coop_id },
                        data: {
                            R19Est: "Con global",
                        }
                    })
                }

                return {
                    movimientoId: movimiento.R19Folio.toString(),
                    evaluacionId: movimiento.R19Folio.toString(),
                    resumenId: resumen.R21Folio.toString(),
                };
            });

            return result;

        } catch (error) {
            this.logger.error('❌ Error en la transacción de creación de Fase 1:', error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 1 - SisConCap" };
        }
    }

    async createOrUpdateFase2(
        input: CreateFase2Input,
        user: Usuario
     ) {
        const { folio, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
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

                // 4. Si el calificativo de fase 1 es CORRECTO -> clonar evaluaciones a fase 2 y 3
                if (resumen.R23Cal === Calificativo.CORRECTO) {
                    // Preparar evaluaciones de fase 3 a partir de las de fase 1
                    const evaluacionesFase3 = evaluaciones.map((ev) => ({
                        R24Folio: folio,
                        R24E_id: ev.R22E_id,
                        R24Res: ev.R22Res as ResFaseII,
                    }));

                    // Crear evaluaciones fase 3
                    await tx.r24EvaluacionFase3Sisconcap.createMany({
                        data: evaluacionesFase3,
                    });

                    // Crear resumen fase 3
                    await tx.r25EvaluacionResumenFase3.create({
                        data: {
                            R25Folio: folio,
                            R25Solv: resumen.R23Solv,
                            R25PSolv: resumen.R23PSolv,
                            R25Rc: resumen.R23Rc,
                            R25Obs: resumen.R23Obs || 'PASO AUTOMÁTICO',
                            R25Cal: Calificativo.CORRECTO,
                            R25FSegG: new Date().toISOString(),
                            R25SP_id: user.R12Id,
                        },
                    });

                    await tx.r19Movimientos.update({
                        where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                        data: {
                            R19Est: "Con global",
                        }
                    })
                }

                return { movimientoId: folio.toString() }
            });

            return result
        } catch (error) {
            this.logger.error("[createOrUpdateFase2] Error:", error);
            // return { success: false, message: error.message || "Error en Fase 2" };
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 2" };
        }
    }

    async createOrUpdateFase3(
        input: CreateFase3Input,
        user: Usuario
    ) {
        const { folio, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
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

                return { movimientoId: folio.toString() }
            });

            return result
        } catch (error) {
            this.logger.error("[createOrUpdateFase3] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 3" };
        }
    }

    async findAll(user: Usuario, filterBySucursal: boolean = true): Promise<Movimiento[]> {

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

        return movimientos.map(mov => ({
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

        return movimientos.map(mov => ({
            ...mov,
            evaluacionResumenFase1: mov.evaluacionResumenFase1 ?? undefined,
            evaluacionResumenFase2: mov.evaluacionResumenFase2 ?? undefined,
            evaluacionResumenFase3: mov.evaluacionResumenFase3 ?? undefined,
        }))
    }

    public async getInventarioMovimientosFiltrado(
        input: InventarioSolicitudesFilterInput,
        user: Usuario,
    ): Promise<InventarioMovimientosResponse> {

        const {
            estado,
            filterBySucursal = true,
            searchText,
            filters,
            paginado = true,
            page = 1,
            pageSize = 50,
            first,
        } = input;

        const offset = first != null && first >= 0
            ? first
            : (Math.max(1, page) - 1) * pageSize;

        const {
            registrosFiltrados,
            totalFiltrados,
        } = await this._obtenerInventarioMovimientosFiltrados(
            estado ?? undefined,
            user,
            filterBySucursal,
            filters ?? undefined,
            searchText ?? undefined,
            paginado,
            offset,
            pageSize,
        );

        const effectivePage = first != null
            ? Math.floor(offset / pageSize) + 1
            : Math.max(1, page);

        const totalPages = paginado
            ? Math.ceil(totalFiltrados / pageSize)
            : 1;

        return {
            registros: registrosFiltrados.map(m => ({
                ...m,
                evaluacionResumenFase1: m.evaluacionResumenFase1 ?? undefined,
                evaluacionResumenFase2: m.evaluacionResumenFase2 ?? undefined,
                evaluacionResumenFase3: m.evaluacionResumenFase3 ?? undefined,
            })),
            page: effectivePage,
            pageSize,
            totalPages,
            totalRegistros: totalFiltrados,
        };
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

    async updateFase1(input: UpdateMovimientoArgs, user: Usuario) {
        const { movimiento, evaluaciones, resumen, folio } = input;

        try {
            const result = await this.$transaction(async (tx) => {
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

                // 6. Evaluar si el Calificativo es CORRECTO, para pasarlo a fase 3 automaticamente
                if (resumen?.R21Cal === Calificativo.CORRECTO) {
                    // Preparar evaluaciones de fase 2 y 3 a partir de las de fase 1
                    const evaluacionesFase2 = evaluaciones?.map((ev) => ({
                        R22Folio: folio,
                        R22E_id: ev.R20E_id,
                        R22Res: ev.R20Res as ResFaseII,
                    }));

                    const evaluacionesFase3 = evaluaciones?.map((ev) => ({
                        R24Folio: folio,
                        R24E_id: ev.R20E_id,
                        R24Res: ev.R20Res as ResFaseII,
                    }));

                    // Crear evaluaciones fase 2
                    await tx.r22EvaluacionFase2Sisconcap.createMany({
                        data: evaluacionesFase2 || [],
                    });

                    // Crear resumen fase 2
                    await tx.r23EvaluacionResumenFase2.create({
                        data: {
                            R23Folio: folio,
                            R23Solv: 0,
                            R23PSolv: 0,
                            R23Rc: resumen.R21Rc,
                            R23Obs: resumen.R21Obs || 'PASO AUTOMÁTICO',
                            R23Cal: Calificativo.CORRECTO,
                            R23FSeg: new Date().toISOString(),
                            R23SP_id: user.R12Id,
                        },
                    });

                    // Crear evaluaciones fase 3
                    await tx.r24EvaluacionFase3Sisconcap.createMany({
                        data: evaluacionesFase3 || [],
                    });

                    // Crear resumen fase 3
                    await tx.r25EvaluacionResumenFase3.create({
                        data: {
                            R25Folio: folio,
                            R25Solv: 0,
                            R25PSolv: 0,
                            R25Rc: resumen.R21Rc,
                            R25Obs: resumen.R21Obs || 'PASO AUTOMÁTICO',
                            R25Cal: Calificativo.CORRECTO,
                            R25FSegG: new Date().toISOString(),
                            R25SP_id: user.R12Id,
                        },
                    });

                    await tx.r19Movimientos.update({
                        where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                        data: {
                            R19Est: "Con global",
                        }
                    })
                }

                return {
                    movimientoId: folio.toString(),
                }
            });

            return result
        } catch (error) {
            this.logger.error('❌ Error en updateFase1:', error);
            return {
                success: false,
                message: error.message || 'No se pudo actualizar el movimiento',
            };
        }
    }

    async remove(folio: number, user: Usuario): Promise<{ movimientoId: string }> {
        await this.findByFolio(folio, user)

        const movimientoDeleted = await this.r19Movimientos.delete({ where: { R19Folio: folio } })

        return { movimientoId: movimientoDeleted.R19Folio.toString() }
    }

    async cancelFase3AndFase2(folio: number, user: Usuario) {
        try {
            const result = await this.$transaction(async (tx) => {
                // Eliminar Fase 3
                await tx.r24EvaluacionFase3Sisconcap.deleteMany({
                    where: { R24Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
                });

                await tx.r25EvaluacionResumenFase3.deleteMany({
                    where: { R25Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
                });

                // Eliminar Fase 2
                await tx.r22EvaluacionFase2Sisconcap.deleteMany({
                    where: { R22Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
                });

                await tx.r23EvaluacionResumenFase2.deleteMany({
                    where: { R23Folio: folio, movimiento: { R19Coop_id: user.R12Coop_id } },
                });

                await tx.r19Movimientos.update({
                    where: { R19Folio: folio, R19Coop_id: user.R12Coop_id },
                    data: {
                        R19Est: "Sin seguimiento",
                    }
                })

                return { movimientoId: folio.toString() };
            });

            return result
        } catch (error) {
            this.logger.error(`Error eliminando evaluaciones del folio ${folio}:`, error);
            return { success: false, message: error instanceof Error ? error.message : "Error al tratar de cancelar fase 3 y fase 2" };
        }
    }

    // * STATS

    public async getInventarioF1Stats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<SisconcapFase1StatisticsOutput> {

        // 1️⃣ Construir el WHERE de movimientos seleccionados (F1 Sisconcap)
        const whereMovimiento = await this._buildInventarioMovimientosWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F1 (R21EvaluacionResumenFase1)
        const whereResumen = {
            movimiento: whereMovimiento
        };

        // 3️⃣ Ejecutar las agregaciones en una sola transacción
        const [
            hallazgosAgg,    // Suma de hallazgos F1
            byCalF1,         // Conteo por calificación F1
            totalMovimientos // Total de movimientos con F1
        ] = await this.$transaction([

            // Total hallazgos = SUM(Ha + Hb + Hm)
            this.r21EvaluacionResumenFase1.aggregate({
                _sum: { R21Ha: true },
                where: whereResumen
            }),

            // Conteos por calificativo (CORRECTO / DEFICIENTE)
            this.r21EvaluacionResumenFase1.groupBy({
                by: ['R21Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total movimientos con resumen fase 1
            this.r21EvaluacionResumenFase1.count({
                where: whereResumen
            })

        ]);

        // 4️⃣ Procesar datos
        const totalMovimientosNum = totalMovimientos ?? 0;

        const totalHallazgos = (hallazgosAgg._sum.R21Ha ?? 0)

        // Mapa de calificaciones
        const mapCalF1 = Object.fromEntries(
            byCalF1.map(g => [
                g.R21Cal,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const correcto = mapCalF1['CORRECTO'] ?? 0;
        const deficiente = mapCalF1['DEFICIENTE'] ?? 0;

        // 5️⃣ Retorno final — MISMO FORMATO QUE SISCONCRE
        return {
            totalMovimientos: totalMovimientosNum,
            totalHallazgos,
            resumen: {
                correcto,
                deficiente
            }
        };
    }

    public async getInventarioF2Stats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<SisconcapFase1StatisticsOutput> {

        // 1️⃣ Construir el WHERE de movimientos seleccionados (F2)
        const whereMovimiento = await this._buildInventarioMovimientosWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F2 (R23EvaluacionResumenFase2)
        const whereResumen = {
            movimiento: whereMovimiento
        };

        // 3️⃣ Ejecutar las agregaciones en una sola transacción
        const [
            hallazgosAgg,      // SUM R23PSolv
            byCalF2,           // Conteos por 'R23Cal'
            totalMovimientos   // Total registros con resumen F2
        ] = await this.$transaction([

            // Total hallazgos = SUM(R23PSolv)
            this.r23EvaluacionResumenFase2.aggregate({
                _sum: { R23PSolv: true },
                where: whereResumen
            }),

            // Conteos por calificativo F2
            this.r23EvaluacionResumenFase2.groupBy({
                by: ['R23Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total movimientos con resumen F2
            this.r23EvaluacionResumenFase2.count({
                where: whereResumen
            })
        ]);


        // 4️⃣ Procesar datos obtenidos
        const totalMovimientosNum = totalMovimientos ?? 0;
        const totalHallazgos = hallazgosAgg._sum.R23PSolv ?? 0;

        // Mapear conteos por calificación
        const mapCalF2 = Object.fromEntries(
            byCalF2.map(g => [
                g.R23Cal,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const deficiente = mapCalF2['DEFICIENTE'] ?? 0;
        const correcto = mapCalF2['CORRECTO'] ?? 0;

        // 5️⃣ Retorno final — MISMA FORMA EXACTA que todos tus otros métodos
        return {
            totalMovimientos: totalMovimientosNum,
            totalHallazgos,
            resumen: {
                deficiente,
                correcto,
            }
        };
    }

    public async getInventarioF3Stats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<SisconcapFase1StatisticsOutput> {

        // 1️⃣ Construir el WHERE de movimientos seleccionados (F3 usa estado ConGlobal)
        const whereMovimiento = await this._buildInventarioMovimientosWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F3 (R25EvaluacionResumenFase3)
        const whereResumen = {
            movimiento: whereMovimiento
        };

        // 3️⃣ Ejecutar todas las agregaciones en una sola transacción
        const [
            hallazgosAgg,     // SUM(R25PSolv)
            byCalF3,          // Conteo por R25Cal
            totalMovimientos  // Total de movimientos F3
        ] = await this.$transaction([

            // Total de hallazgos por solventar
            this.r25EvaluacionResumenFase3.aggregate({
                _sum: { R25PSolv: true },
                where: whereResumen
            }),

            // Conteos por calificativo F3
            this.r25EvaluacionResumenFase3.groupBy({
                by: ['R25Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total registros F3
            this.r25EvaluacionResumenFase3.count({
                where: whereResumen
            })

        ]);

        // 4️⃣ Procesar resultados
        const totalMovimientosNum = totalMovimientos ?? 0;
        const totalHallazgos = hallazgosAgg._sum.R25PSolv ?? 0;

        // Mapa de calificaciones
        const mapCalF3 = Object.fromEntries(
            byCalF3.map(g => [
                g.R25Cal,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const deficiente = mapCalF3['DEFICIENTE'] ?? 0;
        const correcto = mapCalF3['CORRECTO'] ?? 0;

        // 5️⃣ Retorno final — MISMO ESTILO EXACTO QUE F1 Y F2
        return {
            totalMovimientos: totalMovimientosNum,
            totalHallazgos,
            resumen: {
                deficiente,
                correcto,
            }
        };
    }



    // *========================
    // * HELPERS
    // *========================

    private async _obtenerInventarioMovimientosFiltrados(
        estado: string | undefined,
        user: Usuario,
        filterBySucursal: boolean,
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
        paginado: boolean,
        offset: number,
        pageSize: number,
    ) {

        const where = await this._buildInventarioMovimientosWhere(
            estado,
            user,
            filterBySucursal,
            filters,
            searchText,
        );

        const skip = paginado ? Math.max(0, offset) : 0;
        const take = paginado ? pageSize : undefined;

        const [totalFiltrados, registrosFiltrados] = await this.$transaction([
            this.r19Movimientos.count({ where }),

            this.r19Movimientos.findMany({
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
                orderBy: { R19Creado_en: 'desc' },
                skip,
                take,
            }),
        ]);

        return { registrosFiltrados, totalFiltrados };
    }


    private async _buildInventarioMovimientosWhere(
        estado: string | undefined,
        user: Usuario,
        filterBySucursal: boolean,
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
    ) {

        const where: any = {
            R19Coop_id: user.R12Coop_id,
        };

        if (filterBySucursal) {
            where.R19Suc_id = user.R12Suc_id;
        }

        if (estado !== null && estado !== '') {
            where.R19Est = estado;
        }

        const OR: any[] = [];

        // Búsqueda global
        if (searchText && searchText.trim() !== '') {
            const term = searchText.trim();
            const termUpper = term.toUpperCase();
            const isNumeric = /^[0-9]+$/.test(term);

            console.log(searchText);


            if (isNumeric) {
                // búsqueda por folio
                OR.push({ R19Folio: Number(term) });
            }

            OR.push(
                { R19Cag: { contains: term, mode: 'insensitive' } },
                { R19Nom: { contains: term, mode: 'insensitive' } },
                { sucursal: { R11Nom: { contains: term, mode: 'insensitive' } } },
                { evaluacionResumenFase1: { supervisor: { R12Nom: { contains: term, mode: 'insensitive' } } } },
                { evaluacionResumenFase2: { supervisor: { R12Nom: { contains: term, mode: 'insensitive' } } } },
                { evaluacionResumenFase3: { supervisor: { R12Nom: { contains: term, mode: 'insensitive' } } } },
            );

            // ENUMS => usar equals SI coincide con alguna opción del enum
            const enumMovimiento = ['ALTA', 'APERTURA', 'ACTUALIZACION', 'BAJA'];
            const enumFigura = ['MENOR', 'SOCIO'];

            if (enumMovimiento.includes(termUpper)) {
                OR.push({ R19TipoMov: termUpper });
            }

            if (enumFigura.includes(termUpper)) {
                OR.push({ R19Figura: termUpper });
            }

            // Coincidencias por nombre de sucursal
            const sucursalesCoincidentes = await this.r11Sucursal.findMany({
                where: {
                    R11Nom: { contains: term, mode: 'insensitive' },
                    R11Coop_id: user.R12Coop_id,
                },
                select: { R11Id: true },
            });

            if (sucursalesCoincidentes.length > 0) {
                OR.push({
                    R19Suc_id: { in: sucursalesCoincidentes.map(s => s.R11Id) },
                });
            }
        }

        // Filtros PrimeNG
        if (filters) {
            for (const [field, meta] of Object.entries(filters)) {
                const constraint =
                    Array.isArray(meta) ? meta[0] : meta?.constraints?.[0] || meta;

                if (
                    !constraint ||
                    constraint.value === undefined ||
                    constraint.value === null ||
                    constraint.value === ''
                ) {
                    continue;
                }

                const mapped = mapPrimeFilterToPrisma(field, constraint);
                Object.assign(where, mapped);
            }
        }

        if (OR.length > 0) {
            where.OR = OR;
        }

        return where;
    }


}
