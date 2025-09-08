import { Injectable, Logger, HttpStatus, OnModuleInit, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Prisma, PrismaClient, R01Prestamo } from '@prisma/client';

import { CreatePrestamoInput } from './dto/create-solicitud.input';
import { UpdatePrestamoInput } from './dto/update-solicitud.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase1Input } from '../evaluaciones/dto/create-evaluacion-fase1.input';
import { CreateResumenFase1Input } from '../evaluaciones/resumen/dto/create-resumen-fase1.input';
import { UpdateAllPrestamoArgs } from './dto/args/update-all-prestamo.arg';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { ValidEstados } from './enums/valid-estados.enum';
import { EvaluacionFase4ExtendidaDto } from 'src/fase-iv-seg-global/evaluaciones-fase4/dto/evaluacion-fase4-extendida.dto';

@Injectable()
export class SolicitudesService extends PrismaClient implements OnModuleInit {
  private readonly _logger = new Logger('SolicitudesService');

  // constructor(
  //   @Inject(NATS_SERVICE) private readonly _client: ClientProxy,
  // ) {
  //   super();
  // }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(data: CreatePrestamoInput, user: Usuario): Promise<R01Prestamo> {

    const exists = await this.r01Prestamo.findUnique({
      where: { R01NUM: data.R01NUM, R01Coop_id: user.R12Coop_id },
      include: {
        sucursal: true
      }
    });

    if (exists) {
      const sucursal = exists.sucursal.R11Nom
      const socio = exists.R01Nom
      const cag = exists.R01Nso
      const message = `El préstamo con número ${data.R01NUM} ya existe en ${ sucursal } a nombre de ${ socio } con CAG ${ cag }`
      throw new RpcException({
        message,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.r01Prestamo.create({
      data: {
        ...data,
        R01Nom: data.R01Nom.toUpperCase()
      },
      include: {
        sucursal: true
      }
    });
  }

  async findAll( user: Usuario, filterBySucursal: boolean = true ): Promise<R01Prestamo[]> {

    // Base del filtro: siempre filtra por cooperativa y activo
    const where: any = {
      R01Activ: true,
      R01Coop_id: user.R12Coop_id,
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
        resumenF2: true
      },
      orderBy: {
        R01Creado_en: 'desc'
      }
    });
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
    const prestamo = await this.r01Prestamo.findUnique({
      where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
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
        evaluacionesF4: {
          include: {
            elemento: {
              include: { 
                rubro: {
                  include: {
                    grupo: true
                  }
                }
              },
            },
          }
        },
        resumenF4: {
          include: {
            evaluador: true,
          }
        }
      },
    });

    if (!prestamo) {
      throw new RpcException({
        message: `Préstamo con número ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Enriquecer evaluacionesF4 con resF1 y resF3
    prestamo.evaluacionesF4 = await Promise.all(
      prestamo.evaluacionesF4.map(async evaluacion => {
        const resF1 = await this.r05EvaluacionFase1.findFirst({
          where: { R05E_id: evaluacion.R15E_id, R05P_num: id }
        });
        const resF3 = await this.r09EvaluacionFase3.findFirst({
          where: { R09E_id: evaluacion.R15E_id, R09P_num: id }
        });

        return {
          ...evaluacion,
          resF1: resF1?.R05Res || null,
          resF3: resF3?.R09Res || null,
        };
      })
    );

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
      where: { R01NUM: id, R01Coop_id: user.R12Coop_id },
      data: {
        R01NUM,
        R01Nom: rest.R01Nom?.toUpperCase(),
        ...rest,
      },
    });
  }

  async updateAll(input: UpdateAllPrestamoArgs, user: Usuario): Promise<BooleanResponse> {
    const { prestamo, evaluaciones, resumen, currentId } = input;
    const { R01NUM, R01Nso, R01Nom, id, ...rest } = prestamo;

    try {
      await this.$transaction(async (tx) => {
        
        // Verificar que no exista un prestamo con el mismo num
        const exists = await tx.r01Prestamo.findUnique({
          where: { R01NUM, R01Coop_id: user.R12Coop_id },
          include: {
            sucursal: true
          }
        });
        // console.log({exists, currentId});        
        
        if (exists && exists.R01NUM !== currentId) {
          console.log('error');
          
          const sucursal = exists.sucursal.R11Nom
          const socio = exists.R01Nom
          const cag = exists.R01Nso
          const message = `El préstamo con número ${R01NUM} ya existe en ${ sucursal } a nombre de ${ socio } con CAG ${ cag }`
          
          throw new Error(message);
        }
        
        // 1. Actualiza el préstamo
        await tx.r01Prestamo.update({
          where: { R01NUM: currentId, R01Coop_id: user.R12Coop_id },
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
            R05P_num: R01NUM,
            prestamo: { R01Coop_id: user.R12Coop_id },
          },
        });

        // 3. Inserta las nuevas evaluaciones
        await tx.r05EvaluacionFase1.createMany({
          data: evaluaciones.map((ev) => ({
            ...ev,
            R05Id: crypto.randomUUID(),
            R05Ev_por: user.R12Id,
            R05Ev_en: new Date().toISOString(),
          })),
        });

        // 4. Crea o actualiza el resumen
        const existing = await tx.r06EvaluacionResumenFase1.findFirst({
          where: {
            R06P_num: R01NUM,
            prestamo: {
              R01Coop_id: user.R12Coop_id
            }
          },
          include: { prestamo: true }
        });

        if (!existing ) {
          throw new Error('No autorizado para modificar el resumen de esta solicitud');          
        }

        if (existing) {
          await tx.r06EvaluacionResumenFase1.update({
            where: { 
              R06P_num: R01NUM,
              prestamo: { R01Coop_id: user.R12Coop_id },
            },
            data: resumen,
          });
        } else {
          await tx.r06EvaluacionResumenFase1.create({
            data: {
              ...resumen,
              R06Ev_por: user.R12Id,
            },
          });
        }
      });

      return { success: true };

    } catch (error) {
      // console.log('Errror en update', error.message);
      return { success: false, message: error.message || '' }
      // Puedes personalizar el tipo de error según el código de Prisma
      // throw new RpcException({
      //   message: error?.message || 'Ocurrió un error al modificar la solicitud completa',
      //   status: HttpStatus.INTERNAL_SERVER_ERROR,
      // });
    }
  }


  async remove(id: string, user: Usuario): Promise<R01Prestamo> {
    const exists = await this.findById(id, user)

    if (!exists) {
      throw new RpcException({
        message: `No se puede eliminar. Préstamo con número ${id} no existe`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r01Prestamo.delete({ where: { R01NUM: id } })
  }
}
