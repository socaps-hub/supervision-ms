import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, R01Prestamo } from '@prisma/client';
import { randomUUID } from 'crypto';

import { Usuario } from 'src/common/entities/usuario.entity';
import { SisConCreCreateFase1Input } from './dto/inputs/fase1-levantamiento/create-fase1.input';
import { UpdateAllPrestamoArgs } from './dto/args/update-all-prestamo.arg';
import { Fase1StatisticsOutput } from './dto/output/fase1-stats-response.output';
import { Fase2StatisticsOutput } from './dto/output/fase2-stats-response.output';
import { Fase3StatisticsOutput } from './dto/output/fase3-stats-response.output';
import { Fase4StatisticsOutput } from './dto/output/fase4-stats-response.output';
import { InventarioSolicitudesResponse } from './dto/output/inventario-solicitudes-response.output';
import { ValidEstados } from './enums/valid-estados.enum';
import { InventarioSolicitudesFilterInput } from './dto/inputs/solicitudes/inventario-solicitudes-filter.input';
import { UpdatePrestamoInput } from './dto/inputs/solicitudes/update-solicitud.input';
import { SisConCreCreateFase2Input } from './dto/inputs/fase2-seguimiento/create-fase2input';
import { SisConCreCreateFase3Input } from './dto/inputs/fase3-desembolso/create-fase3.input';
import { SisConCreCreateFase4Input } from './dto/inputs/fase4-seguimiento-global/create-or-update-fase4.input';
import { Calificativo } from './enums/evaluacion.enum';
import { CreateEvaluacionFase4Input } from './dto/inputs/fase4-seguimiento-global/evaluacion/create-evaluacion-fase4.input';
import { CreateEvaluacionResumenFase4Input } from './dto/inputs/fase4-seguimiento-global/resumen/create-evaluacion-resumen-fase4.input';
import { ResFaseII } from './enums/evaluacion-fase2.enum';
import { buildPrismaWhereFromPrimeFilters } from 'src/common/utils/prisma-where-from-prime-filters.builder';
import { getFechaMexicoISO } from 'src/common/utils/date.util';

@Injectable()
export class SolicitudesService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('SolicitudesService')

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Base de datos conectada');
    }

    // * FASES ACTIONS
    async createFase1(
        input: SisConCreCreateFase1Input,
        user: Usuario,
    ) {
        try {
            const { prestamo, evaluaciones, resumen } = input

            const result = await this.$transaction(async (tx) => {
                // 0. Verificar NO existencia de la solicitud
                const exists = await tx.r01Prestamo.findUnique({
                    where: {
                        R01NUM_R01Coop_id: {
                            R01NUM: prestamo.R01NUM,
                            R01Coop_id: user.R12Coop_id,
                        }
                    },
                    include: {
                        sucursal: true
                    }
                });
                if (exists) {
                    const sucursal = exists.sucursal.R11Nom
                    const socio = exists.R01Nom
                    const cag = exists.R01Nso
                    const message = `El préstamo con número ${prestamo.R01NUM} ya existe en ${sucursal} a nombre de ${socio} con CAG ${cag}`
                    throw new Error(message)
                }

                // 1. Crear movimiento
                const prestamoDB = await tx.r01Prestamo.create({
                    data: {
                        ...prestamo,
                        R01Id: randomUUID(),
                        R01Nom: prestamo.R01Nom.toUpperCase()
                    },
                    include: {
                        sucursal: true
                    }
                });

                // 2. Crear evaluaciones asociadas al prestamo
                const evaluacionesData = evaluaciones.map((ev) => ({
                    ...ev,
                    R05P_id: prestamoDB.R01Id,
                    R05Ev_por: user.R12Id,
                    R05Ev_en: getFechaMexicoISO(),
                }));

                const evaluacion = await tx.r05EvaluacionFase1.createMany({
                    data: evaluacionesData,
                });

                // 3. Crear resumen asociado al movimiento
                const resumenDB = await tx.r06EvaluacionResumenFase1.create({
                    data: {
                        ...resumen,
                        R06P_id: prestamoDB.R01Id,
                        R06Ev_por: user.R12Id,
                        R06Id: randomUUID(),
                    },
                });
                return {
                    prestamoId: prestamoDB.R01Id,
                    evaluacionId: prestamoDB.R01Id,
                    resumenId: resumenDB.R06Id,
                };
            });

            return result;

        } catch (error) {
            this.logger.error("[createFase1 - SisConCre] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 1 - SisConCre" };
        }
    }

    async updateAll(input: UpdateAllPrestamoArgs, user: Usuario) {
        const { prestamo, evaluaciones, resumen, currentId } = input;
        const { R01NUM, R01Nso, R01Nom, id, ...rest } = prestamo;

        try {
            const result = await this.$transaction(async (tx) => {

                // Verificar que no exista un prestamo con el mismo num
                const exists = await tx.r01Prestamo.findUnique({
                    where: {
                        R01Id: currentId,
                    },
                    include: {
                        sucursal: true
                    }
                });
                // console.log({exists, currentId});        

                if (exists && exists.R01Id !== currentId) {
                    const sucursal = exists.sucursal.R11Nom
                    const socio = exists.R01Nom
                    const cag = exists.R01Nso
                    const message = `El préstamo con número ${R01NUM} ya existe en ${sucursal} a nombre de ${socio} con CAG ${cag}`

                    throw new Error(message);
                }

                // 1. Actualiza el préstamo
                const prestamoUpdated = await tx.r01Prestamo.update({
                    where: {
                        R01Id: currentId
                    },
                    data: {
                        R01NUM,
                        R01Nso,
                        R01Nom: R01Nom?.toUpperCase(),
                        ...rest
                    },
                });

                // 2. Elimina evaluaciones antiguas
                await tx.r05EvaluacionFase1.deleteMany({
                    where: {
                        R05P_id: currentId,
                    },
                });

                // 3. Inserta las nuevas evaluaciones
                await tx.r05EvaluacionFase1.createMany({
                    data: evaluaciones.map((ev) => ({
                        ...ev,
                        R05P_id: currentId,
                        R05Id: crypto.randomUUID(),
                        R05Ev_por: user.R12Id,
                        R05Ev_en: getFechaMexicoISO(),
                    })),
                });

                // 4. Crea o actualiza el resumen
                const existing = await tx.r06EvaluacionResumenFase1.findUnique({
                    where: {
                        R06P_id: currentId,
                    },
                });

                if (!existing) {
                    throw new Error('No autorizado para modificar el resumen de esta solicitud');
                }

                if (existing) {
                    await tx.r06EvaluacionResumenFase1.update({
                        where: {
                            R06P_id: currentId,
                        },
                        data: resumen,
                    });
                } else {
                    await tx.r06EvaluacionResumenFase1.create({
                        data: {
                            ...resumen,
                            R06Id: crypto.randomUUID(),
                            R06P_id: currentId,
                            R06Ev_por: user.R12Id,
                        },
                    });
                }

                return {
                    prestamoId: prestamoUpdated.R01Id,
                    evaluacionId: prestamoUpdated.R01Id,
                    resumenId: existing.R06Id,
                };
            });

            return result;

        } catch (error) {
            this.logger.error("[updateAll - SisConCre] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en actualización de Fase 1 - SisConCre" };
        }
    }

    async createOrUpdateFase2(
        input: SisConCreCreateFase2Input,
        user: Usuario,
    ) {
        const { prestamoId, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
                // 1. Eliminar evaluaciones y resumen previos
                await tx.r07EvaluacionFase2.deleteMany({
                    where: { R07P_id: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } },
                });

                await tx.r08EvaluacionResumenFase2.deleteMany({
                    where: { R08P_id: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } },
                });

                if (!evaluaciones || evaluaciones.length === 0) {
                    throw new Error("Debe registrar al menos una evaluación en Fase 2");
                }

                // 2. Insertar nuevas evaluaciones
                await tx.r07EvaluacionFase2.createMany({
                    data: evaluaciones.map((ev) => ({
                        R07P_id: prestamoId,
                        R07E_id: ev.R07E_id,
                        R07Res: ev.R07Res,
                        R07Ev_por: user.R12Id,
                        R07Ev_en: getFechaMexicoISO(),
                    })),
                });

                // 3. Insertar resumen con fecha generada automáticamente
                const newResumen = await tx.r08EvaluacionResumenFase2.create({
                    data: {
                        R08P_id: prestamoId,
                        R08FSeg: getFechaMexicoISO(),
                        R08Ev_por: user.R12Id,
                        ...resumen,
                    },
                });

                // 4. Actualizar Estado del movimiento a "Con seguimiento"
                const prestamoUpdated = await tx.r01Prestamo.update({
                    where: { R01Id: prestamoId, R01Coop_id: user.R12Coop_id },
                    data: {
                        R01Est: "Con seguimiento",
                    }
                })

                return {
                    prestamoId: prestamoUpdated.R01Id,
                    evaluacionId: prestamoUpdated.R01Id,
                    resumenId: newResumen.R08Id,
                };
            });

            return result;
        } catch (error) {
            this.logger.error("[createOrUpdateFase2 - SisConCre] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 2 - SisConCre" };
        }
    }

    async createOrUpdateFase3(
        input: SisConCreCreateFase3Input,
        user: Usuario,
    ) {
        const { prestamoId, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
                // 1. Eliminar evaluaciones y resumen previos
                await tx.r09EvaluacionFase3.deleteMany({
                    where: { R09P_id: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } },
                });

                await tx.r10EvaluacionResumenFase3.deleteMany({
                    where: { R10P_id: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } },
                });

                if (!evaluaciones || evaluaciones.length === 0) {
                    throw new Error("Debe registrar al menos una evaluación en Fase 3");
                }

                // 2. Insertar nuevas evaluaciones
                await tx.r09EvaluacionFase3.createMany({
                    data: evaluaciones.map((ev) => ({
                        R09P_id: prestamoId,
                        R09E_id: ev.R09E_id,
                        R09Res: ev.R09Res,
                        R09Ev_en: getFechaMexicoISO(),
                    })),
                });

                // 3. Insertar resumen con fecha generada automáticamente
                const newResumen = await tx.r10EvaluacionResumenFase3.create({
                    data: {
                        R10P_id: prestamoId,
                        R10FDes: getFechaMexicoISO(),
                        R10Sup: user.R12Id,
                        ...resumen,
                    },
                });

                // 4. Actualizar Estado del movimiento a "Con seguimiento"
                const prestamoUpdated = await tx.r01Prestamo.update({
                    where: { R01Id: prestamoId, R01Coop_id: user.R12Coop_id },
                    data: {
                        R01Est: "Con desembolso",
                    }
                })

                return {
                    prestamoId: prestamoUpdated.R01Id,
                    evaluacionId: prestamoUpdated.R01Id,
                    resumenId: newResumen.R10Id,
                };
            });

            return result;
        } catch (error) {
            this.logger.error("[createOrUpdateFase3 - SisConCre] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 3 - SisConCre" };
        }
    }

    async createOrUpdateFase4(
        input: SisConCreCreateFase4Input,
        user: Usuario,
    ) {
        const { prestamoId, evaluaciones, resumen } = input;

        try {
            const result = await this.$transaction(async (tx) => {
                // ✅ 0. Validar que el préstamo pertenezca a la cooperativa del usuario
                const prestamoDB = await tx.r01Prestamo.findUnique({
                    where: { R01Id: prestamoId },
                    select: { R01Coop_id: true },
                });

                if (!prestamoDB) {
                    throw new Error('El préstamo no existe');
                }

                if (prestamoDB.R01Coop_id !== user.R12Coop_id) {
                    throw new Error('No autorizado para modificar este préstamo');
                }

                // 1. Eliminar evaluaciones y resumen previos
                await tx.r15EvaluacionFase4.deleteMany({
                    where: { R15P_id: prestamoId },
                });

                await tx.r16EvaluacionResumenFase4.deleteMany({
                    where: { R16P_id: prestamoId },
                });

                if (!evaluaciones || evaluaciones.length === 0) {
                    throw new Error("Debe registrar al menos una evaluación en Fase 4");
                }

                // 2. Insertar nuevas evaluaciones
                await tx.r15EvaluacionFase4.createMany({
                    data: evaluaciones.map((ev) => ({
                        R15P_id: prestamoId,
                        R15E_id: ev.R15E_id,
                        R15Res: ev.R15Res,
                    })),
                });

                // 3. Insertar resumen con fecha generada automáticamente
                const newResumen = await tx.r16EvaluacionResumenFase4.create({
                    data: {
                        R16P_id: prestamoId,
                        R16SolvT: resumen.R16SolvT,
                        R16SolvA: resumen.R16SolvA,
                        R16SolvM: resumen.R16SolvM,
                        R16SolvB: resumen.R16SolvB,
                        R16SegCal: resumen.R16SegCal,
                        R16DesCal: resumen.R16DesCal,
                        R16CalF: resumen.R16CalF,
                        R16HaSolv: resumen.R16HaSolv,
                        R16PenCu: resumen.R16PenCu,
                        R16RcF: resumen.R16RcF,
                        R16Obs: resumen.R16Obs,
                        R16FGlo: getFechaMexicoISO(),
                        R16Ev_por: resumen.R16Ev_por,
                    },
                });

                // 4. Actualizar Estado del movimiento a "Con seguimiento"
                const prestamoUpdated = await tx.r01Prestamo.update({
                    where: { R01Id: prestamoId, R01Coop_id: user.R12Coop_id },
                    data: {
                        R01Est: "Con global",
                    }
                })

                return {
                    prestamoId: prestamoUpdated.R01Id,
                    evaluacionId: prestamoUpdated.R01Id,
                    resumenId: newResumen.R16Id,
                };
            });

            return result;
        } catch (error) {
            this.logger.error("[createOrUpdateFase4 - SisConCre] Error:", error);
            return { success: false, message: error instanceof Error ? error.message : "Error en Fase 4 - SisConCre" };
        }
    }

    async pasoMasivoAFase4(user: Usuario): Promise<{
        success: boolean;
        message: string;
        prestamoIds: string[];
    }> {
        const prestamos = await this.r01Prestamo.findMany({
            where: {
                R01Coop_id: user.R12Coop_id,
                R01Est: "Con desembolso",
                resumenF2: { R08Cal: Calificativo.CORRECTO },
                resumenF3: { R10Cal: Calificativo.CORRECTO },
                resumenF4: null // aún no tienen seguimiento global
            },
            include: {
                evaluacionesF2: true,
                evaluacionesF3: true,
                resumenF2: true,
                resumenF3: true
            }
        });

        const prestamoIds: string[] = [];
        if (!prestamos.length) {
            return { success: false, message: 'No hay préstamos elegibles para pasar a Seguimiento Global', prestamoIds, };
        }

        for (const prestamo of prestamos) {
            const evaluaciones: CreateEvaluacionFase4Input[] = [];

            prestamoIds.push(prestamo.R01NUM);

            for (const ev of prestamo.evaluacionesF2) {
                evaluaciones.push({
                    R15E_id: ev.R07E_id,
                    R15Res: ev.R07Res,
                });
            }

            for (const ev of prestamo.evaluacionesF3) {
                evaluaciones.push({
                    R15E_id: ev.R09E_id,
                    R15Res: ev.R09Res as ResFaseII,
                });
            }

            const resumen: CreateEvaluacionResumenFase4Input = {
                R16SolvA: prestamo.resumenF2?.R08SolvA ?? 0,
                R16SolvM: prestamo.resumenF2?.R08SolvM ?? 0,
                R16SolvB: prestamo.resumenF2?.R08SolvB ?? 0,
                R16SolvT: prestamo.resumenF2?.R08SolvT ?? 0,
                R16SegCal: prestamo.resumenF2?.R08Cal ?? 'CORRECTO',
                R16DesCal: prestamo.resumenF3?.R10Cal ?? 'CORRECTO',
                R16CalF: 'CORRECTO',
                R16HaSolv: prestamo.resumenF3?.R10Ha ?? 0,
                R16PenCu: prestamo.resumenF3?.R10Pendientes ?? 0,
                R16RcF: prestamo.resumenF3?.R10Rc ?? 0,
                R16Ev_por: user.R12Id, // o el ID del usuario que ejecuta
                R16Obs: 'Registro masivo automático',
            };

            await this.r15EvaluacionFase4.createMany({ data: evaluaciones.map(e => ({ R15P_id: prestamo.R01Id, ...e })) });
            await this.r16EvaluacionResumenFase4.create({
                data: {
                    ...resumen,
                    R16P_id: prestamo.R01Id,
                    R16FGlo: getFechaMexicoISO(),
                    R16Ev_por: user.R12Id,
                },
            });

            await this.r01Prestamo.update({
                where: { R01Id: prestamo.R01Id },
                data: { R01Est: 'Con global' }
            });
        }

        const prestamoOrPrestamos = prestamos.length === 1 ? 'préstamo pasó' : 'prestamos pasaron'

        return {
            success: true,
            message: `${prestamos.length} ${prestamoOrPrestamos} a Seguimiento Global automáticamente.`,
            prestamoIds,
        };
    }


    // * INVENTARIOS

    public async getInventarioSolicitudesFiltrado(
        input: InventarioSolicitudesFilterInput,
        user: Usuario,
    ): Promise<InventarioSolicitudesResponse> {

        const {
            estado,                   // 👈 puede venir undefined/null
            filterBySucursal = true,
            searchText,
            filters,
            paginado = true,
            page = 1,
            pageSize = 50,
            first,
        } = input;

        // 🔹 Offset compatible con PrimeNG (first) + paginado tradicional
        const offset = first != null && first >= 0
            ? first
            : (Math.max(1, page) - 1) * pageSize;

        const {
            registrosFiltrados,
            totalFiltrados,
        } = await this._obtenerInventarioSolicitudesRegistrosFiltrados(
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
            registros: registrosFiltrados.map(s => ({
                ...s,
                resumenF1: s.resumenF1 ?? undefined,
                resumenF2: s.resumenF2 ?? undefined,
                resumenF3: s.resumenF3 ?? undefined,
                resumenF4: s.resumenF4 ?? undefined,
            })),
            page: effectivePage,
            pageSize,
            totalPages,
            totalRegistros: totalFiltrados,
        };
    }

    async findByEstado(estado: ValidEstados, user: Usuario, filterBySucursal: boolean = true): Promise<R01Prestamo[]> {
        const estadosValidos = [
            'Con seguimiento',
            'Sin seguimiento',
            'Con desembolso',
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
            R01Activ: true,
            R01Coop_id: user.R12Coop_id,
            R01Est: estado,
        };

        // Si la bandera está activa, también filtra por sucursal
        if (filterBySucursal) {
            where.R01Suc_id = user.R12Suc_id;
        }

        return await this.r01Prestamo.findMany({
            where,
            include: {
                categoria: true,
                producto: true,
                sucursal: true,
                supervisor: true,
                ejecutivo: true,
                resumenF1: {
                    include: {
                        evaluador: true
                    }
                },
                resumenF2: {
                    include: {
                        evaluador: true
                    }
                },
                resumenF3: {
                    include: {
                        evaluador: true,
                        supervisor: true
                    }
                },
                resumenF4: {
                    include: {
                        evaluador: true
                    }
                }
            },
            orderBy: {
                R01Creado_en: 'desc',
            },
        });
    }

    async findById(id: string, user: Usuario): Promise<R01Prestamo> {
        const prestamo = await this.r01Prestamo.findFirst({
            where: {
                R01Id: id,
            },
            include: {
                categoria: true,
                producto: true,
                sucursal: true,
                supervisor: true,
                ejecutivo: true,
                evaluacionesF1: true,
                resumenF1: {
                    include: {
                        evaluador: true
                    }
                },
                evaluacionesF2: true,
                resumenF2: {
                    include: {
                        evaluador: true
                    }
                },
                evaluacionesF3: true,
                resumenF3: {
                    include: {
                        evaluador: true,
                        supervisor: true
                    }
                },
            },
        });

        if (!prestamo) {
            throw new RpcException({
                message: `Préstamo con número ${id} no encontrado`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        return prestamo;
    }

    // async findF4EvaluationsById(id: string, user: Usuario): Promise<R01Prestamo> {
    //     const prestamo = await this.r01Prestamo.findUnique({
    //         where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
    //         include: {
    //             categoria: true,
    //             producto: true,
    //             sucursal: true,
    //             supervisor: true,
    //             ejecutivo: true,
    //             evaluacionesF4: {
    //                 include: {
    //                     elemento: {
    //                         include: {
    //                             rubro: {
    //                                 include: {
    //                                     grupo: true
    //                                 }
    //                             }
    //                         },
    //                     },
    //                 }
    //             },
    //             resumenF4: {
    //                 include: {
    //                     evaluador: true,
    //                 }
    //             }
    //         },
    //     });

    //     if (!prestamo) {
    //         throw new RpcException({
    //             message: `Préstamo con número ${id} no encontrado`,
    //             status: HttpStatus.NOT_FOUND,
    //         });
    //     }

    //     // Enriquecer evaluacionesF4 con resF1 y resF3
    //     prestamo.evaluacionesF4 = await Promise.all(
    //         prestamo.evaluacionesF4.map(async evaluacion => {
    //             const resF1 = await this.r05EvaluacionFase1.findFirst({
    //                 where: { R05E_id: evaluacion.R15E_id, R05P_num: id }
    //             });
    //             const resF3 = await this.r09EvaluacionFase3.findFirst({
    //                 where: { R09E_id: evaluacion.R15E_id, R09P_num: id }
    //             });

    //             return {
    //                 ...evaluacion,
    //                 resF1: resF1?.R05Res || null,
    //                 resF3: resF3?.R09Res || null,
    //             };
    //         })
    //     );

    //     return prestamo;
    // }


    async findF4EvaluationsById(id: string, user: Usuario): Promise<R01Prestamo> {
        // 1) Trae el préstamo + evaluaciones F4 con su jerarquía, y el resumen (en una sola ida)
        const prestamo = await this.r01Prestamo.findUnique({
            where: {
                R01Id: id
            },
            include: {
                categoria: true,
                producto: true,
                sucursal: true,
                supervisor: true,
                ejecutivo: true,

                evaluacionesF4: {
                    include: {
                        elemento: {
                            include: {
                                rubro: {
                                    include: {
                                        grupo: true,
                                    },
                                },
                            },
                        },
                    },
                },

                resumenF4: {
                    include: { evaluador: true },
                },
            },
        });

        if (!prestamo) {
            throw new RpcException({
                message: `Préstamo con número ${id} no encontrado`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        // 2) Si no hay evaluaciones, regresa temprano (evita queries innecesarias)
        if (!prestamo.evaluacionesF4?.length) {
            // Normaliza campos extra (por si el front espera resF1/resF3)
            prestamo.evaluacionesF4 = [];
            return prestamo;
        }

        // 3) Enriquecimiento por lote (adiós N+1):
        //    - Tomamos todos los elementoIds presentes en F4
        const elementoIds = Array.from(
            new Set(prestamo.evaluacionesF4.map(e => e.R15E_id).filter(Boolean)),
        );

        // Defensa extra: si por alguna razón no hay ids, no consultamos
        if (!elementoIds.length) {
            prestamo.evaluacionesF4 = prestamo.evaluacionesF4.map(e => ({
                ...e,
                resF1: null,
                resF3: null,
            }));
            return prestamo;
        }

        // 4) Consultas en paralelo a F1 y F3 (solo las filas del préstamo + elementos relevantes)
        const [f1Rows, f3Rows] = await Promise.all([
            this.r05EvaluacionFase1.findMany({
                where: {
                    R05P_id: id,
                    R05E_id: { in: elementoIds },
                },
                select: {
                    R05E_id: true,
                    R05Res: true,
                },
            }),
            this.r09EvaluacionFase3.findMany({
                where: {
                    R09P_id: id,
                    R09E_id: { in: elementoIds },
                },
                select: {
                    R09E_id: true,
                    R09Res: true,
                },
            }),
        ]);

        // 5) Indexación en memoria para O(1) lookup
        const f1Map = new Map<string, any>(f1Rows.map(r => [r.R05E_id, r.R05Res]));
        const f3Map = new Map<string, any>(f3Rows.map(r => [r.R09E_id, r.R09Res]));

        // 6) Enriquecer sin más queries
        prestamo.evaluacionesF4 = prestamo.evaluacionesF4.map(e => ({
            ...e,
            resF1: f1Map.get(e.R15E_id) ?? null,
            resF3: f3Map.get(e.R15E_id) ?? null,
        }));

        return prestamo;
    }

    async update(id: string, data: UpdatePrestamoInput, user: Usuario): Promise<R01Prestamo> {
        const exists = await this.findById(id, user)


        if (!exists) {
            throw new RpcException({
                message: `No se puede actualizar. Préstamo con número ${id} no existe`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        const { id: R01NUM, ...rest } = data

        return await this.r01Prestamo.update({
            where: { R01Id: id, R01Coop_id: user.R12Coop_id },
            data: {
                R01NUM,
                R01Nom: rest.R01Nom?.toUpperCase(),
                ...rest,
            },
        });
    }

    async remove(id: string, user: Usuario): Promise<{ prestamoId: string }> {
        const exists = await this.r01Prestamo.findFirst({
            where: { R01Id: id, R01Coop_id: user.R12Coop_id },
        })

        if (!exists) {
            throw new RpcException({
                message: `No se puede eliminar. Préstamo con número ${id} no existe`,
                status: HttpStatus.NOT_FOUND,
            });
        }

        const prestamoRemoved = await this.r01Prestamo.delete({ where: { R01Id: id, R01Coop_id: user.R12Coop_id } })

        return { prestamoId: prestamoRemoved.R01NUM }
    }


    // *==================
    // * STATS
    // *==================

    // Inv Solicitudes

    public async getInventarioSolicitudesStats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario,
    ): Promise<Fase1StatisticsOutput> {

        // 1️⃣ Construimos el WHERE completo y filtrado
        const wherePrestamo = await this._buildInventarioSolicitudesWhere(
            input.estado ?? undefined,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        const whereResumen = {
            prestamo: wherePrestamo,
        };

        // 2️⃣ Ejecutamos todo en un $transaction como Auditoría
        const [
            hallazgosAgg,
            byCalificativo,
            byResolucion,
            totalSolicitudes,
        ] = await this.$transaction([

            // Total de hallazgos
            this.r06EvaluacionResumenFase1.aggregate({
                _sum: { R06Ha: true, R06Hb: true, R06Hm: true },
                where: whereResumen,
            }),

            // Conteos agrupados por Calificativo (CORRECTO / ACEPTABLE / DEFICIENTE)
            this.r06EvaluacionResumenFase1.groupBy({
                by: ['R06Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined,
            }),

            // Conteos agrupados por Resolución (PASA_COMITE / DEVUELTA)
            this.r06EvaluacionResumenFase1.groupBy({
                by: ['R06Res'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined,
            }),

            // Total de solicitudes filtradas
            this.r06EvaluacionResumenFase1.count({
                where: whereResumen,
            }),
        ]);

        // 3️⃣ Total hallazgos
        const totalHallazgos =
            (hallazgosAgg._sum.R06Ha ?? 0) +
            (hallazgosAgg._sum.R06Hb ?? 0) +
            (hallazgosAgg._sum.R06Hm ?? 0);

        // 4️⃣ Mapeo tipo Auditoría
        const mapCal = Object.fromEntries(
            byCalificativo.map((g) => {
                const cnt = typeof g._count === 'object' ? (g._count._all ?? 0) : 0;
                return [g.R06Cal, cnt];
            }),
        );

        const mapRes = Object.fromEntries(
            byResolucion.map((g) => {
                const cnt = typeof g._count === 'object' ? (g._count._all ?? 0) : 0;
                return [g.R06Res, cnt];
            }),
        );

        // 5️⃣ Conteos finales
        const deficiente = mapCal['DEFICIENTE'] ?? 0;
        const aceptable = mapCal['ACEPTABLE'] ?? 0;
        const correcto = mapCal['CORRECTO'] ?? 0;

        const pasaComite = mapRes['PASA_COMITE'] ?? 0;
        const devuelta = mapRes['DEVUELTA'] ?? 0;

        // 6️⃣ Porcentajes basado en totalSolicitudes filtradas
        const pct = (n: number) =>
            totalSolicitudes === 0
                ? '0%'
                : `${Math.round((n / totalSolicitudes) * 100)}%`;

        // 7️⃣ Retorno EXACTAMENTE como tu interfaz
        return {
            totalSolicitudes,
            totalHallazgos,

            resumen: {
                deficiente,
                aceptable,
                correcto,
            },

            resoluciones: {
                pasaComite,
                devuelta,
            },

            porcentaje: {
                deficiente: pct(deficiente),
                aceptable: pct(aceptable),
                correcto: pct(correcto),
                pasaComite: pct(pasaComite),
                devuelta: pct(devuelta),
            },
        };
    }

    // Seguimiento
    public async getInventarioSeguimientosStats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<Fase2StatisticsOutput> {

        // 1️⃣ Construir el WHERE de préstamos seleccionados (F2)
        const wherePrestamo = await this._buildInventarioSolicitudesWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F2 (R08EvaluacionResumenFase2)
        const whereResumen = {
            prestamo: wherePrestamo
        };

        // 3️⃣ Ejecutar las agregaciones en una sola transacción
        const [
            hallazgosAgg,
            correctosAgg,
            solventadosAgg,
            byCalF2,
            totalSolicitudes
        ] = await this.$transaction([

            // Total hallazgos = Ha + Hb + Hm del resumen F1
            this.r06EvaluacionResumenFase1.aggregate({
                _sum: { R06Ha: true, R06Hb: true, R06Hm: true },
                where: {
                    prestamo: wherePrestamo
                }
            }),

            // Total correctos F2 = SUM(R08Rc)
            this.r08EvaluacionResumenFase2.aggregate({
                _sum: { R08Rc: true },
                where: whereResumen
            }),

            // Total solventados = SUM(R08SolvT)
            this.r08EvaluacionResumenFase2.aggregate({
                _sum: { R08SolvT: true },
                where: whereResumen
            }),

            // Conteos por calificativo F2
            this.r08EvaluacionResumenFase2.groupBy({
                by: ['R08Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total solicitudes (préstamos) con resumen F2
            this.r08EvaluacionResumenFase2.count({
                where: whereResumen
            })

        ]);

        // 4️⃣ Procesar datos
        const totalSolicitudesNum = totalSolicitudes ?? 0;

        const totalHallazgos =
            (hallazgosAgg._sum.R06Ha ?? 0) +
            (hallazgosAgg._sum.R06Hb ?? 0) +
            (hallazgosAgg._sum.R06Hm ?? 0);

        const totalCorrectos = correctosAgg._sum.R08Rc ?? 0;
        const totalSolventados = solventadosAgg._sum.R08SolvT ?? 0;

        // Conteo por Calificativo
        const mapCalF2 = Object.fromEntries(
            byCalF2.map(g => [
                g.R08Cal,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const deficiente = mapCalF2['DEFICIENTE'] ?? 0;
        const correcto = mapCalF2['CORRECTO'] ?? 0;

        // 5️⃣ Retorno final (mismo estilo exacto que auditoría)
        return {
            totalSolicitudes: totalSolicitudesNum,
            totalHallazgos,
            totalCorrectos,
            totalSolventados,
            resumen: {
                deficiente,
                correcto,
            }
        };
    }

    // DESEMBOLSO
    public async getInventarioDesembolsosStats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<Fase3StatisticsOutput> {

        // 1️⃣ Construir el WHERE de préstamos seleccionados (F3)
        const wherePrestamo = await this._buildInventarioSolicitudesWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F3 (R10EvaluacionResumenFase3)
        const whereResumen = {
            prestamo: wherePrestamo
        };

        // 3️⃣ Ejecutar las agregaciones en una sola transacción
        const [
            hallazgosAgg,
            correctosAgg,
            pendientesAgg,
            byCalF3,
            totalSolicitudes
        ] = await this.$transaction([

            // Total hallazgos = Ha + Hb + Hm del resumen F3 (CORRECTO)
            this.r10EvaluacionResumenFase3.aggregate({
                _sum: { R10Ha: true },
                where: whereResumen
            }),

            // Total correctos F3 = SUM(R10Rc)
            this.r10EvaluacionResumenFase3.aggregate({
                _sum: { R10Rc: true },
                where: whereResumen
            }),

            // Total pendientes F3 = SUM(R10Rp)
            this.r10EvaluacionResumenFase3.aggregate({
                _sum: { R10Pendientes: true },
                where: whereResumen
            }),

            // Conteos por calificativo F3
            this.r10EvaluacionResumenFase3.groupBy({
                by: ['R10Cal'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total solicitudes con resumen F3
            this.r10EvaluacionResumenFase3.count({
                where: whereResumen
            })

        ]);

        // 4️⃣ Procesar datos
        const totalSolicitudesNum = totalSolicitudes ?? 0;

        const totalHallazgos =
            (hallazgosAgg._sum.R10Ha ?? 0)

        const totalCorrectos = correctosAgg._sum.R10Rc ?? 0;
        const totalPendientes = pendientesAgg._sum.R10Pendientes ?? 0;

        // Conteo por Calificativo
        const mapCalF3 = Object.fromEntries(
            byCalF3.map(g => [
                g.R10Cal,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const deficiente = mapCalF3['DEFICIENTE'] ?? 0;
        const pendientes = mapCalF3['PENDIENTE'] ?? 0;
        const correcto = mapCalF3['CORRECTO'] ?? 0;

        // 5️⃣ Retorno final (idéntico estilo)
        return {
            totalSolicitudes: totalSolicitudesNum,
            totalHallazgos,
            totalCorrectos,
            totalPendientes,
            resumen: {
                deficiente,
                pendientes,
                correcto,
            }
        };
    }

    // GLOBAL
    public async getInventarioSeguimientoGlobalStats(
        input: InventarioSolicitudesFilterInput,
        user: Usuario
    ): Promise<Fase4StatisticsOutput> {

        // 1️⃣ Construir el WHERE de préstamos seleccionados (F4 usa estado ConGlobal)
        const wherePrestamo = await this._buildInventarioSolicitudesWhere(
            input.estado,
            user,
            input.filterBySucursal ?? true,
            input.filters ?? undefined,
            input.searchText ?? undefined,
        );

        // 2️⃣ WHERE para el resumen F4 (R16EvaluacionResumenFase4)
        const whereResumen = {
            prestamo: wherePrestamo
        };

        // 3️⃣ Ejecutar las agregaciones en una sola transacción
        const [
            byCalF4,          // Conteo por calificación final
            totalSolicitudes  // Total de solicitudes con resumen F4
        ] = await this.$transaction([

            // Conteos por calificativo F4: R16CalF
            this.r16EvaluacionResumenFase4.groupBy({
                by: ['R16CalF'],
                _count: { _all: true },
                where: whereResumen,
                orderBy: undefined
            }),

            // Total solicitudes
            this.r16EvaluacionResumenFase4.count({
                where: whereResumen
            })

        ]);

        // 4️⃣ Procesar datos obtenidos
        const totalSolicitudesNum = totalSolicitudes ?? 0;

        // Construir mapa de calificaciones
        const mapCalF4 = Object.fromEntries(
            byCalF4.map(g => [
                g.R16CalF,
                typeof g._count === 'object' && g._count ? (g._count._all ?? 0) : 0
            ])
        );

        const deficiente = mapCalF4['DEFICIENTE'] ?? 0;
        const aceptable = mapCalF4['ACEPTABLE'] ?? 0;
        const correcto = mapCalF4['CORRECTO'] ?? 0;

        // 5️⃣ Retorno final — MISMO ESTILO EXACTO que los anteriores
        return {
            totalSolicitudes: totalSolicitudesNum,
            resumen: {
                deficiente,
                aceptable,
                correcto,
            }
        };
    }

    // * =================
    // * HELPERS
    // * =================

    private async _obtenerInventarioSolicitudesRegistrosFiltrados(
        estado: string | undefined,                 // 👈 puede ser undefined
        user: Usuario,
        filterBySucursal: boolean,
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
        paginado: boolean,
        offset: number,
        pageSize: number,
    ) {
        const where = await this._buildInventarioSolicitudesWhere(
            estado,
            user,
            filterBySucursal,
            filters,
            searchText,
        );

        const skip = paginado ? Math.max(0, offset) : 0;
        const take = paginado ? pageSize : undefined;

        const [totalFiltrados, registrosFiltrados] = await this.$transaction([
            this.r01Prestamo.count({ where }),
            this.r01Prestamo.findMany({
                where,
                include: {
                    categoria: true,
                    producto: {
                        include: {
                            categoria: true,
                        },
                    },
                    sucursal: true,
                    supervisor: true,
                    ejecutivo: true,
                    resumenF1: {
                        include: {
                            evaluador: true,
                        },
                    },
                    resumenF2: {
                        include: {
                            evaluador: true,
                        }
                    },
                    resumenF3: {
                        include: {
                            evaluador: true,
                            supervisor: true,
                        }
                    },
                    resumenF4: {
                        include: {
                            evaluador: true,
                        }
                    }
                },
                orderBy: {
                    R01Creado_en: 'desc',
                },
                skip,
                take,
            }),
        ]);

        return { registrosFiltrados, totalFiltrados };
    }


    // private async _buildInventarioSolicitudesWhere(
    //     estado: string | undefined,
    //     user: Usuario,
    //     filterBySucursal: boolean,
    //     filters: Record<string, any> | undefined,
    //     searchText: string | undefined,
    // ) {
    //     const where: any = {
    //         R01Activ: true,
    //         R01Coop_id: user.R12Coop_id,
    //     };

    //     if (filterBySucursal) {
    //         where.R01Suc_id = user.R12Suc_id;
    //     }

    //     // 🔹 Estado solo si viene definido (no null / no undefined)
    //     if (estado !== null && estado !== '') {

    //         where.R01Est = estado;
    //     }

    //     const OR: any[] = [];

    //     // 🔹 Búsqueda global (caja de texto de la tabla)
    //     if (searchText && searchText.trim() !== '') {
    //         const term = searchText.trim();
    //         const isNumeric = /^[0-9]+$/.test(term);

    //         if (isNumeric) {
    //             // búsqueda por número de préstamo
    //             // OR.push({ R01NUM: Number(term) });
    //         }

    //         OR.push(
    //             { R01NUM: { contains: term, mode: 'insensitive' } },   // CAG
    //             { R01Nso: { contains: term, mode: 'insensitive' } },   // CAG
    //             { R01Nom: { contains: term, mode: 'insensitive' } },   // Socio
    //             { R01Est: { contains: term, mode: 'insensitive' } },   // Estado
    //             { sucursal: { R11Nom: { contains: term, mode: 'insensitive' } } },
    //             { supervisor: { R12Nom: { contains: term, mode: 'insensitive' } } },
    //             { resumenF2: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
    //             { resumenF3: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
    //             { resumenF4: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
    //             // { categoria: { R14Nom: { contains: term, mode: 'insensitive' } } },
    //         );

    //         // Coincidencias por nombre de sucursal
    //         const sucursalesCoincidentes = await this.r11Sucursal.findMany({
    //             where: {
    //                 R11Nom: { contains: term, mode: 'insensitive' },
    //                 R11Coop_id: user.R12Coop_id,
    //             },
    //             select: { R11Id: true },
    //         });

    //         if (sucursalesCoincidentes.length > 0) {
    //             OR.push({
    //                 R01Suc_id: { in: sucursalesCoincidentes.map((s) => s.R11Id) },
    //             });
    //         }
    //     }

    //     // 🔹 Filtros por columna (PrimeNG)
    //     if (filters) {

    //         for (const [field, meta] of Object.entries(filters)) {
    //             const constraint =
    //                 Array.isArray(meta) ? meta[0] : meta?.constraints?.[0] || meta;

    //             if (
    //                 !constraint ||
    //                 constraint.value === undefined ||
    //                 constraint.value === null ||
    //                 constraint.value === ''
    //             ) {
    //                 continue;
    //             }

    //             const mapped = mapPrimeFilterToPrisma(field, constraint);

    //             console.log(where, mapped);                

    //             // Fusionamos el resultado al where
    //             Object.assign(where, mapped);
    //         }
    //     }

    //     if (OR.length > 0) {
    //         where.OR = OR;
    //     }

    //     return where;
    // }

    private async _buildInventarioSolicitudesWhere(
        estado: string | undefined,
        user: Usuario,
        filterBySucursal: boolean,
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
    ) {
        const where: any = {
            // R01Activ: true,
            R01Coop_id: user.R12Coop_id,
        };

        if (filterBySucursal) {
            where.R01Suc_id = user.R12Suc_id;
        }

        if (estado !== null && estado !== undefined && estado !== '') {
            where.R01Est = estado;
        }

        /* =========================
         * OR – búsqueda global
         * ========================= */
        const OR: any[] = [];

        if (searchText?.trim()) {
            const term = searchText.trim();

            OR.push(
                { R01NUM: { contains: term, mode: 'insensitive' } },
                { R01Nso: { contains: term, mode: 'insensitive' } },
                { R01Nom: { contains: term, mode: 'insensitive' } },
                { R01Est: { contains: term, mode: 'insensitive' } },
                { sucursal: { R11Nom: { contains: term, mode: 'insensitive' } } },
                { supervisor: { R12Nom: { contains: term, mode: 'insensitive' } } },
                { resumenF1: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
                { resumenF2: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
                { resumenF3: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
                { resumenF4: { evaluador: { R12Nom: { contains: term, mode: 'insensitive' } } } },
            );

            const sucursales = await this.r11Sucursal.findMany({
                where: {
                    R11Nom: { contains: term, mode: 'insensitive' },
                    R11Coop_id: user.R12Coop_id,
                },
                select: { R11Id: true },
            });

            if (sucursales.length) {
                OR.push({ R01Suc_id: { in: sucursales.map(s => s.R11Id) } });
            }

            where.OR = OR;
        }

        if (OR.length > 0) {
            where.OR = OR;
        }

        /* =========================
         * AND – filtros por columna
         * ========================= */
        Object.assign(
            where,
            buildPrismaWhereFromPrimeFilters(filters),
        );

        return where;
    }

}
