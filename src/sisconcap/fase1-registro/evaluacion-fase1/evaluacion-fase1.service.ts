import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateSisconcapEvaluacionFase1Input } from './dto/inputs/create-sisconcap-evaluacion-fase1.input';
import { SisconcapEvaluacionFase1 } from './entities/sisconcap-evaluacion-fase1.entity';

@Injectable()
export class EvaluacionFase1Service extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('EvaluacionFase1Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  // async create(
  //   input: CreateSisconcapEvaluacionFase1Input,
  // ): Promise<SisconcapEvaluacionFase1> {
  //   try {

  //     const evaluacion = await this.r20EvaluacionFase1Sisconcap.create({
  //       data: {
  //         R20Folio: input.R20Folio,
  //         R20E_id: input.R20E_id,
  //         R20Res: input.R20Res,
  //       },
  //     });

  //     return evaluacion
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new RpcException({
  //       message: 'Error al crear la evaluación de fase 1',
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

  // async createMany(
  //   inputs: CreateSisconcapEvaluacionFase1Input[],
  // ): Promise<boolean> {
  //   try {
  //     const evaluaciones = inputs.map((input) => ({
  //       ...input,
  //       R20Id: crypto.randomUUID(),   // Generamos el UUID para cada evaluación
  //     }));

  //     await this.r20EvaluacionFase1Sisconcap.createMany({
  //       data: evaluaciones,
  //     });

  //     return true;
  //   } catch (error) {
  //     console.error('❌ Error al crear evaluaciones Sisconcap Fase I:', error);
  //     throw new RpcException({
  //       message: 'No se pudieron guardar las evaluaciones Sisconcap Fase I',
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

}
