import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CreateGrupoInput } from './dto/create-grupo.input';
import { UpdateGrupoInput } from './dto/update-grupo.input';
import { Grupo } from './entities/grupo.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GruposService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('GruposService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createGrupoInput: CreateGrupoInput): Promise<Grupo> {

    const { R02Nom, R02Coop_id } = createGrupoInput

    const grupo = await this.r02Grupo.findFirst({
      where: {
        R02Nom: R02Nom.trim(),
        R02Coop_id,
      }
    })

    if ( grupo ) {
      throw new RpcException({
        message: `Ya existe el grupo ${ R02Nom } en esa cooperativa`,
        status: HttpStatus.BAD_REQUEST,
      })
    }

    return await this.r02Grupo.create({
      data: {
        ...createGrupoInput
      },
      // include: {
      //   cooperativa: {
      //     select: {
      //       R17Id: true,
      //       R17Nom: true,
      //       R17Activ: true,
      //       R17Logo: true,
      //       R17Creada_en: true,
      //       sucursales: true,
      //       productos: {
      //         select: {
      //           R13Id: true,
      //           R13Nom: true,
      //           R13Cat_id: true,
      //           R13Activ: true,
      //           R13Coop_id: true,
      //           categoria: true,
      //         }
      //       },
      //     }
      //   }
      // }
    })
  }

  async findAll( coopId: string ): Promise<Grupo[]> {

    const grupos = await this.r02Grupo.findMany({
      where: {
        R02Coop_id: coopId
      },
      orderBy: {
        R02Creado_en: 'desc'
      },
      // include: {
      //   cooperativa: {
      //     select: {
      //       R17Id: true,
      //       R17Nom: true,
      //       R17Activ: true,
      //       R17Logo: true,
      //       R17Creada_en: true,
      //       sucursales: true,
      //       productos: {
      //         select: {
      //           R13Id: true,
      //           R13Nom: true,
      //           R13Cat_id: true,
      //           R13Activ: true,
      //           R13Coop_id: true,
      //           categoria: true,
      //         }
      //       },
      //     }
      //   }
      // }
    })

    console.log('Handler llamado', grupos);
    
    
    return grupos
  }

  async findById(id: string): Promise<Grupo> {

    const grupo = await this.r02Grupo.findFirst({
      where: { R02Id: id }
    })

    if ( !grupo ) {
      throw new RpcException({
        message: `El grupo con id ${ id } no existe`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return grupo;
  }

  async update(id: string, updateGrupoInput: UpdateGrupoInput): Promise<Grupo> {
    const grupoDB = await this.findById(id)

    const { R02Nom, R02Coop_id } = updateGrupoInput

    if ( R02Nom ) {
      const grupo = await this.r02Grupo.findFirst({
        where: { R02Nom: R02Nom.trim(), R02Coop_id }
      })

      if ( grupo && grupo.R02Id !== id ) {
        console.log({id1: grupo.R02Id, id});
        
        throw new RpcException({
          message: `El grupo ${ R02Nom } ya existe en la cooperativa`,
          status: HttpStatus.BAD_REQUEST
        })
      }
    }

    return await this.r02Grupo.update({
      where: { R02Id: id },
      data: {
        R02Coop_id: grupoDB.R02Coop_id,
        R02Nom: R02Nom ? R02Nom: grupoDB.R02Nom
      }
    })
  }

  async remove(id: string): Promise<Grupo> {    
    await this.findById(id)
    return this.r02Grupo.delete({
      where: { R02Id: id }
    })
  }
}
