import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionFase4 } from './entities/evaluacion-fase4.entity';
import { CreateEvaluacionFase4Input } from './dto/inputs/create-evaluacion-fase4.input';
import { UpdateEvaluacionFase4Input } from './dto/inputs/update-evaluacion-fase4.input';

@Injectable()
export class EvaluacionesFase4Service extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('EvaluacionesFase4Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Base de datos conectada (Fase 4)');
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
        elemento: true,
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
