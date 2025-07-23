import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, R06EvaluacionResumenFase1 } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateResumenFase1Input } from './dto/create-resumen-fase1.input';
import { UpdateResumenFase1Input } from './dto/update-resumen-fase1.input';
import { EvaluacionResumenFase1 } from './entities/resumen-fase1.entity';

@Injectable()
export class ResumenFase1Service extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ResumenFase1Service');

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Base de datos conectada');
  }

  async create(data: CreateResumenFase1Input, user: Usuario): Promise<EvaluacionResumenFase1> {
    const exists = await this.r06EvaluacionResumenFase1.findUnique({
      where: { 
        R06P_num: data.R06P_num,
        prestamo: {
          R01Coop_id: user.R12Coop_id
        }
      }
    });

    if (exists) {
      throw new RpcException({
        message: `Ya existe un resumen de evaluación para el préstamo ${data.R06P_num}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.r06EvaluacionResumenFase1.create({
      data: {
        ...data,
        R06Ev_por: user.R12Id, // Asignar el ID del evaluador
      }
    });
  }

  async findAll(user: Usuario): Promise<EvaluacionResumenFase1[]> {
    return await this.r06EvaluacionResumenFase1.findMany({
      where: {
        prestamo: {
          R01Activ: true,
          R01Coop_id: user.R12Coop_id
        }
      },
      include: {
        prestamo: true,
        evaluador: true,
      }
    });
  }

  async findOne(R06P_num: string, user: Usuario): Promise<EvaluacionResumenFase1> {
    const resumen = await this.r06EvaluacionResumenFase1.findUnique({
      where: { 
        R06P_num,
        prestamo: {
          R01Coop_id: user.R12Coop_id
        }
      },
      include: {
        prestamo: true,
        evaluador: true,
      }
    });

    if (!resumen || resumen.prestamo.R01Coop_id !== user.R12Coop_id) {
      throw new RpcException({
        message: `Resumen de evaluación con número de préstamo ${R06P_num} no existe`,
        status: HttpStatus.NOT_FOUND
      });
    }

    return resumen;
  }

  async update(R06P_num: string, data: UpdateResumenFase1Input, user: Usuario): Promise<EvaluacionResumenFase1> {
    const exists = await this.findOne(R06P_num, user);

    if (!exists) {
      throw new RpcException({
        message: `No se puede actualizar. El resumen con número ${R06P_num} no existe`,
        status: HttpStatus.NOT_FOUND
      });
    }

    return await this.r06EvaluacionResumenFase1.update({

      where: { R06P_num },
      data
    });
  }
}
