import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateLimitePrudencialArgs } from './dto/args/create-limite-prudencial.arg';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class LimitePrudencialService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('LimitePrudencialService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createLimitePrudencialArgs: CreateLimitePrudencialArgs) {

    const { createLimitePrudencialInput, usuario } = createLimitePrudencialArgs
    const { R18Importe } = createLimitePrudencialInput

    const limitePrudencial = await this.r18LimitePrudencial.findFirst({
      where: { R18Importe, R18Coop_id: usuario.R12Coop_id }
    })

    if ( limitePrudencial ) {
      // SI ya existe, se modifica la fecha de creación para que sea el actual
      return await this.r18LimitePrudencial.update({
        where: { R18Id: limitePrudencial.R18Id },
        data: {
          R18Importe,
          R18Coop_id: usuario.R12Coop_id,
          R18Creado_en: new Date()
        }
      })
    }

    return await this.r18LimitePrudencial.create({
      data: {
        ...createLimitePrudencialInput,
        R18Coop_id: usuario.R12Coop_id
      },
      include: {
        cooperativa: true
      }
    });
  }

  async findLast( user: Usuario ) {
    return this.r18LimitePrudencial.findFirst({
      where: { R18Coop_id: user.R12Coop_id },
      orderBy: {
        R18Creado_en: 'desc'
      },
      include: {
        cooperativa: true
      }
    })
  }

  // findAll() {
  //   return `This action returns all limitePrudencial`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} limitePrudencial`;
  // }

  // update(id: number, updateLimitePrudencialInput: UpdateLimitePrudencialInput) {
  //   return `This action updates a #${id} limitePrudencial`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} limitePrudencial`;
  // }
}
