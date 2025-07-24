import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionFase4 } from './entities/evaluacion-fase4.entity';
import { CreateEvaluacionFase4Input } from './dto/inputs/create-evaluacion-fase4.input';
import { UpdateEvaluacionFase4Input } from './dto/inputs/update-evaluacion-fase4.input';
import { CreateEvaluacionResumenFase4Input } from './resumen-fase4/dto/inputs/create-evaluacion-resumen-fase4.input';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { SaveEvaluacionesFase4Args } from './dto/args/save-evaluaciones-fase4.args';

@Injectable()
export class EvaluacionesFase4Service extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('EvaluacionesFase4Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Base de datos conectada (Fase 4)');
  }

  async saveEvaluacionesFase4(
    { evaluaciones, resumen }: SaveEvaluacionesFase4Args,
    user: Usuario,
  ): Promise<BooleanResponse> {

    const prestamoId = resumen.R16P_num;

    try {
      await this.$transaction(async (tx) => {

        // ✅ 0. Validar que el préstamo pertenezca a la cooperativa del usuario
        const prestamo = await tx.r01Prestamo.findUnique({
          where: { R01NUM: prestamoId },
          select: { R01Coop_id: true },
        });

        if (!prestamo) {
          throw new Error('El préstamo no existe');
        }

        if (prestamo.R01Coop_id !== user.R12Coop_id) {
          throw new Error('No autorizado para modificar este préstamo');
        }

        // Validación: al menos una evaluación
        if (!evaluaciones.length) {
          throw new Error('No se proporcionaron evaluaciones para guardar');
        }

        // 1. Eliminar evaluaciones anteriores de fase 4
        await tx.r15EvaluacionFase4.deleteMany({
          where: { R15P_num: prestamoId },
        });

        // 2. Insertar nuevas evaluaciones
        await tx.r15EvaluacionFase4.createMany({
          data: evaluaciones.map((ev) => ({
            R15Id: crypto.randomUUID(),
            R15P_num: ev.R15P_num,
            R15E_id: ev.R15E_id,
            R15Res: ev.R15Res,
          })),
        });

        // 3. Eliminar resumen anterior si existe
        await tx.r16EvaluacionResumenFase4.delete({
          where: { R16P_num: prestamoId },
        }).catch(() => {
          // No se lanza error si no existe
        });

        // 4. Crear nuevo resumen
        await tx.r16EvaluacionResumenFase4.create({
          data: {
            R16P_num: resumen.R16P_num,
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
            R16FGlo: new Date().toISOString(),
            R16Ev_por: resumen.R16Ev_por,
          },
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Error en saveEvaluacionesFase4:', error.message);
      return {
        success: false,
        message: error.message || 'Ocurrió un error al guardar la evaluación de Fase 4',
      };
    }
  }

  async createMany(inputs: CreateEvaluacionFase4Input[], user: Usuario): Promise<boolean> {
    try {
      const evaluaciones = inputs.map(input => ({
        R15Id: crypto.randomUUID(),
        R15P_num: input.R15P_num,
        R15E_id: input.R15E_id,
        R15Res: input.R15Res,
      }));

      await this.r15EvaluacionFase4.createMany({
        data: evaluaciones,
      });

      return true;
    } catch (error) {
      console.error('❌ Error al crear evaluaciones Fase IV:', error);
      throw new RpcException({
        message: 'No se pudieron guardar las evaluaciones Fase IV.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(prestamoId: string, user: Usuario): Promise<EvaluacionFase4[]> {
    return await this.r15EvaluacionFase4.findMany({
      where: { 
        R15P_num: prestamoId,
        prestamo: {
            R01Coop_id: user.R12Coop_id
        }
    },
      include: {
        elemento: {
          include: { rubro: true },
        },
        prestamo: true,
      },
    });
  }

  async update(id: string, input: UpdateEvaluacionFase4Input): Promise<EvaluacionFase4> {
    const evaluacion = await this.r15EvaluacionFase4.findUnique({ where: { R15Id: id } });

    if (!evaluacion) {
      throw new RpcException({
        message: `Evaluación con ID ${id} no encontrada`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r15EvaluacionFase4.update({
      where: { R15Id: id },
      data: {
        R15Res: input.R15Res,
      },
    });
  }

  async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
    try {
      await this.r15EvaluacionFase4.deleteMany({
        where: { 
            R15P_num: prestamoId,
            prestamo: { R01Coop_id: user.R12Coop_id },
        },
      });

      return true;
    } catch (error) {
      throw new RpcException({
        message: 'No se pudieron eliminar las evaluaciones anteriores de Fase IV',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
