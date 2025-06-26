import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, ResFaseI } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase1Input } from './dto/create-evaluacion-fase1.input';
import { UpdateEvaluacionFase1Input } from './dto/update-evaluacion-fase1.input';
import { EvaluacionFase1 } from './entities/evaluacion-fase1.entity';

@Injectable()
export class EvaluacionesFase1Service extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('EvaluacionesFase1Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  async create(input: CreateEvaluacionFase1Input, user: Usuario): Promise<EvaluacionFase1> {
    try {
      return await this.r05EvaluacionFase1.create({
        data: {
          R05P_num: input.R05P_num,
          R05E_id: input.R05E_id,
          R05Res: input.R05Res as ResFaseI,
          R05Ev_por: user.R12Id,
          R05Ev_en: new Date().toISOString()
        },
      });
    } catch (error) {
      throw new RpcException({
        message: 'No se pudo crear la evaluación.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createMany(inputs: CreateEvaluacionFase1Input[], usuario: Usuario): Promise<boolean> {
    try {
      const evaluaciones = inputs.map((input) => ({
        ...input,
        R05Id: crypto.randomUUID(),
        R05Ev_por: usuario.R12Id,
        R05Ev_en: new Date().toISOString(),
      }));

      await this.r05EvaluacionFase1.createMany({
        data: evaluaciones,
      });

      return true;

    } catch (error) {
      console.error('❌ Error al crear evaluaciones Fase I:', error);
      throw new RpcException({
        message: 'No se pudieron guardar las evaluaciones',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(prestamoId: string, user: Usuario): Promise<EvaluacionFase1[]> {
    return await this.r05EvaluacionFase1.findMany({
      where: { R05P_num: prestamoId, R05Ev_por: user.R12Id },
      include: {
        elemento: true,
        evaluador: {
          include: {
            sucursal: true,
          },
        },
      },
    });
  }

  async update(id: string, input: UpdateEvaluacionFase1Input, user: Usuario): Promise<EvaluacionFase1> {
    const evaluacion = await this.r05EvaluacionFase1.findUnique({ where: { R05Id: id, R05Ev_por: user.R12Id } });

    if (!evaluacion) {
      throw new RpcException({
        message: `Evaluación con ID ${id} no encontrada`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r05EvaluacionFase1.update({
      where: { R05Id: id },
      data: {
        R05Res: input.R05Res,
      },
    });
  }
}
