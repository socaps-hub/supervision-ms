import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateLimitePrudencialInput } from './dto/inputs/create-limite-prudencial.input';
import { RpcException } from '@nestjs/microservices';
import { Usuario } from 'src/common/entities/usuario.entity';

@Injectable()
export class LimitePrudencialService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('LimitePrudencialService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createLimitePrudencialInput: CreateLimitePrudencialInput, user: Usuario) {

    const { R18Importe } = createLimitePrudencialInput

    try {

      const limitePrudencial = await this.r18LimitePrudencial.findFirst({
        where: { R18Importe, R18Coop_id: user.R12Coop_id }
      })

      if ( limitePrudencial ) {
        // SI ya existe, se modifica la fecha de creación para que sea el actual
        await this.r18LimitePrudencial.update({
          where: { R18Id: limitePrudencial.R18Id },
          data: {
            R18Importe,
            R18Coop_id: user.R12Coop_id,
            R18Creado_en: new Date()
          },
        })

        return { limitePrudencialId: limitePrudencial.R18Id }
      }

      const limitePrudCreated = await this.r18LimitePrudencial.create({
        data: {
          ...createLimitePrudencialInput,
          R18Coop_id: user.R12Coop_id
        },
      });
      
      return { limitePrudencialId: limitePrudCreated.R18Id }
    } catch (error) {
      this._logger.error("[Limite prudencial create - SisConCre] Error:", error);
      return { success: false, message: error instanceof Error ? error.message : "Error en creación/actualización de límite prudencial - SisConCre" };
    }    
  }

  async findLast( user: Usuario ) {
    const limitePrudencial = await this.r18LimitePrudencial.findFirst({
      where: { R18Coop_id: user.R12Coop_id },
      orderBy: {
        R18Creado_en: 'desc'
      }
    })

    if ( !limitePrudencial ) {
      throw new RpcException({
        message: 'No hay un límite prudencial en tu cooperativa'
      })
    }

    return limitePrudencial
  }
}