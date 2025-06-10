import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateLimitePrudencialInput } from './dto/inputs/create-limite-prudencial.input';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class LimitePrudencialService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('LimitePrudencialService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createLimitePrudencialInput: CreateLimitePrudencialInput, user: Usuario) {

    const { R18Importe } = createLimitePrudencialInput

    const limitePrudencial = await this.r18LimitePrudencial.findFirst({
      where: { R18Importe, R18Coop_id: user.R12Coop_id }
    })

    if ( limitePrudencial ) {
      // SI ya existe, se modifica la fecha de creación para que sea el actual
      return await this.r18LimitePrudencial.update({
        where: { R18Id: limitePrudencial.R18Id },
        data: {
          R18Importe,
          R18Coop_id: user.R12Coop_id,
          R18Creado_en: new Date()
        },
        include: {
          cooperativa: {
            select: {
              R17Id: true,
              R17Nom: true,
              R17Activ: true,
              R17Logo: true,
              sucursales: true,
            }
          },
        }
      })
    }

    return await this.r18LimitePrudencial.create({
      data: {
        ...createLimitePrudencialInput,
        R18Coop_id: user.R12Coop_id
      },
      include: {
        cooperativa: {
          select: {
            R17Id: true,
            R17Nom: true,
            R17Activ: true,
            R17Logo: true,
            sucursales: true,
          }
        },
      }
    });
  }

  async findLast( user: Usuario ) {
    console.log(user);
    
    const limitePrudencial = await this.r18LimitePrudencial.findFirst({
      where: { R18Coop_id: user.R12Coop_id },
      orderBy: {
        R18Creado_en: 'desc'
      },
      include: {
        cooperativa: {
          select: {
            R17Id: true,
            R17Nom: true,
            R17Activ: true,
            R17Logo: true,
            sucursales: true,
          }
        },
      }
    })

    if ( !limitePrudencial ) {
      throw new RpcException({
        message: 'No hay un límite prudencial en tu cooperativa'
      })
    }

    return limitePrudencial
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