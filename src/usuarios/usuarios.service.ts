import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { UpdateUsuarioInput } from './dto/update-usuario.input';
import { PrismaClient } from '@prisma/client';
import { create } from 'domain';
import { Usuario } from './entities/usuario.entity';
import { bcryptAdapter } from 'src/config';

@Injectable()
export class UsuariosService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')

  // create(createSucursaleInput: CreateSucursaleInput) {
  //   return 'This action adds a new sucursale';
  // }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async findAll( role?: 'ejecutivo'|'admin'|'supervisor' ): Promise<Usuario[]> {

    let users: Usuario[] = []

    if ( role) {
      users = await this.r12Usuario.findMany({
        where: { R12Rol: role },
        include: {
          sucursal: true
        }
      })
      
      return users
    }

    users = await this.r12Usuario.findMany({
      include: {
        sucursal: true
      }
    })

    return users
  }

  async create(createUsuarioInput: CreateUsuarioInput) {

      const { R12Ni, R12Password } = createUsuarioInput
  
      const user = await await this.r12Usuario.findFirst({
        where: { R12Ni }
      })
  
      if ( user ) {
        throw new BadRequestException(`Usuario con NI ${ R12Ni } ya existe`)
      }
  
      return this.r12Usuario.create({
        data: {
          ...createUsuarioInput,
          R12Password: bcryptAdapter.hash(R12Password)
        }
      })

  }

  async findByNI( userNI: string ): Promise<Usuario> {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Ni: userNI },
      include: {
        sucursal: true
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new NotFoundException(`Usuario con el NI ${ userNI } no existe`)
    }

    return user
  }

  async findByID( id: string ): Promise<Usuario> {
    
    const user = await this.r12Usuario.findFirst({
      where: { R12Id: id },
      include: {
        sucursal: true
      }
    })

    if ( !user || !user.R12Activ ) {
      throw new NotFoundException(`Usuario con el id ${ id } no existe`)
    }

    return user
  }

}
