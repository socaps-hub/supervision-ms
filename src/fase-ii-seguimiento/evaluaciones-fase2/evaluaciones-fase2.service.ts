import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, ResFaseII } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionFase2 } from './entities/evaluacion-fase2.entity';
import { CreateEvaluacionFase2Input } from './dto/inputs/create-evaluacion-fase2.input';
import { UpdateEvaluacionFase2Input } from './dto/inputs/update-evaluacion-fase2.input';

@Injectable()
export class EvaluacionesFase2Service extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('EvaluacionesFase2Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Conexión a base de datos establecida para EvaluacionesFase2');
  }

  async createMany(inputs: CreateEvaluacionFase2Input[], usuario: Usuario): Promise<boolean> {
    try {
      const evaluaciones = inputs.map((input) => ({
        R07Id: crypto.randomUUID(),
        R07P_num: input.R07P_num,
        R07E_id: input.R07E_id,
        R07Res: input.R07Res,
        R07Ev_por: usuario.R12Id,
        R07Ev_en: new Date().toISOString(),
      }));

      await this.r07EvaluacionFase2.createMany({
        data: evaluaciones,
      });

      return true;
    } catch (error) {
      console.error('❌ Error al crear evaluaciones Fase II:', error);
      throw new RpcException({
        message: 'No se pudieron guardar las evaluaciones Fase II.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(prestamoId: string, user: Usuario): Promise<EvaluacionFase2[]> {
    return await this.r07EvaluacionFase2.findMany({
        where: { R07P_num: prestamoId, R07Ev_por: user.R12Id },
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

  async update(id: string, input: UpdateEvaluacionFase2Input, user: Usuario): Promise<EvaluacionFase2> {
    const evaluacion = await this.r07EvaluacionFase2.findUnique({
      where: { R07Id: id },
    });

    if (!evaluacion || evaluacion.R07Ev_por !== user.R12Id) {
      throw new RpcException({
        message: `Evaluación con ID ${id} no encontrada o no autorizada.`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return await this.r07EvaluacionFase2.update({
      where: { R07Id: id },
      data: {
        R07Res: input.R07Res,
      },
    });
  }

  async deleteByPrestamo(prestamoId: string, user: Usuario): Promise<boolean> {
    try {
      await this.r07EvaluacionFase2.deleteMany({
        where: { R07P_num: prestamoId, prestamo: { R01Coop_id: user.R12Coop_id } }
      });
      return true;
    } catch (error) {
      throw new RpcException({
        message: 'No se pudieron eliminar las evaluaciones anteriores',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  
}
