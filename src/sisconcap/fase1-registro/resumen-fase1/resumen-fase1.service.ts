import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateSisconcapEvaluacionResumenFase1Input } from './dto/inputs/create-sisconcap-resumen-fase1.input';
import { Usuario } from 'src/common/entities/usuario.entity';

@Injectable()
export class ResumenFase1Service extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ResumenFase1Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  // async create(input: CreateSisconcapEvaluacionResumenFase1Input, user: Usuario) {
  //   try {
  //     const resumen = await this.r21EvaluacionResumenFase1.create({
  //       data: {
  //         R21Folio: input.R21Folio,
  //         R21Ha: input.R21Ha,
  //         R21Rc: input.R21Rc,
  //         R21Cal: input.R21Cal,
  //         R21Obs: input.R21Obs,
  //         R21Ejvo_id: input.R21Ejvo_id,
  //         R21SP_id: user.R12Id,
  //       },
  //     });

  //     return resumen;

  //   } catch (error) {
  //     this.logger.error('❌ Error al crear resumen fase 1 Sisconcap', error);
  //     throw new RpcException({
  //       message: 'No se pudo crear el resumen de la evaluación Fase I (Sisconcap)',
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

}
