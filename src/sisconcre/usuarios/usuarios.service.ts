import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioArgs } from './dto/args/create-usuario.arg';
import { ValidRoles } from 'src/common/valid-roles.enum';
import { bcryptAdapter } from 'src/config';

@Injectable()
export class UsuariosService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }
  
  // create(createSucursaleInput: CreateSucursaleInput) {
  //   return 'This action adds a new sucursale';
  // }

  async findAll( role: ValidRoles, user: Usuario ): Promise<Usuario[]> {

    let users: Usuario[] = []

    if ( role ) {
      users = await this.r12Usuario.findMany({
        orderBy: {
          R12Creado_en: 'desc'
        },
        where: { R12Rol: role, R12Coop_id: user.R12Coop_id, R12Activ: true },
        include: {
          sucursal: true
        }
      })
      
      return users
    }

    users = await this.r12Usuario.findMany({
      orderBy: {
          R12Creado_en: 'desc'
      },
      include: {
        sucursal: true
      }
    })

    return users
  }

  async create(createUsuarioArgs: CreateUsuarioArgs) {

      const { createUsuarioInput, usuario } = createUsuarioArgs
      const { R12Ni, R12Password } = createUsuarioInput
  
      const userDB = await await this.r12Usuario.findFirst({
        where: { R12Ni },
      })
  
      if ( userDB ) {

        if ( !userDB.R12Activ ) {
          console.log(userDB.R12Rol);
          
          throw new BadRequestException(`${ userDB.R12Rol.toUpperCase() } con clave ${ R12Ni } -> ${ userDB.R12Nom } esta desactivado`)
        }

        throw new BadRequestException(`Usuario con clave ${ R12Ni } ya existe`)
      }
  
      return this.r12Usuario.create({
        data: {
          ...createUsuarioInput,
          R12Coop_id: usuario.R12Coop_id,
          R12Password: bcryptAdapter.hash(R12Password)
        },
        include: {
          sucursal: true
        }
      })

  }

  async findByNI( userNI: string, withSucursales: boolean = false ): Promise<Usuario> {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: userNI },
      include: {
        sucursal: withSucursales
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new NotFoundException(`Usuario con clave ${ userNI } no existe`)
    }

    return user
  }

  async findByID( id: string ) {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Id: id },
      include: {
        sucursal: {
          select: { R11Nom: true, R11NumSuc: true }
        }
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new NotFoundException(`Usuario con id ${ id } no existe`)
    }

    return user
  }

  async activate( userNI: string ) {

    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: userNI },
      include: {
        sucursal: true
      }
    })

    if ( !user ) {
      throw new NotFoundException(`Usuario con clave ${ userNI } no existe`)
    }

    user.R12Activ = true

    return this.r12Usuario.update({
      where: { R12Ni: userNI },
      data: {
        R12Id: user.R12Id,
        R12Ni: user.R12Ni,
        R12Password: user.R12Password,
        R12Nom: user.R12Nom,
        R12Suc_id: user.R12Suc_id,
        R12Rol: user.R12Rol,
        R12Activ: user.R12Activ,
        R12Creado_en: user.R12Creado_en,
        R12Coop_id: user.R12Coop_id,
      },
      include: {
        sucursal: true
      }
    })

  }

  async desactivate( id: string ) {

    const user = await this.findByID( id )
    user.R12Activ = false

    return this.r12Usuario.update({
      where: { R12Id: id },
      data: {
        R12Id: user.R12Id,
        R12Ni: user.R12Ni,
        R12Password: user.R12Password,
        R12Nom: user.R12Nom,
        R12Suc_id: user.R12Suc_id,
        R12Rol: user.R12Rol,
        R12Activ: user.R12Activ,
        R12Creado_en: user.R12Creado_en,
        R12Coop_id: user.R12Coop_id,
      },
      include: {
        sucursal: true
      }
    })

  }

}
