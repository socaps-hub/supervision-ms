import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSucursaleInput } from './dto/create-sucursale.input';
import { UpdateSucursaleInput } from './dto/update-sucursale.input';
import { Sucursal } from './entities/sucursal.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class SucursalesService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('SucursalesService')

  // create(createSucursaleInput: CreateSucursaleInput) {
  //   return 'This action adds a new sucursale';
  // }

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async findAll( user: Usuario ): Promise<Sucursal[]> {
    return await this.r11Sucursal.findMany({
      // where: {
      //   R11Coop_id: user.
      // }
    })
  }

  async findOne(id: string, user: Usuario): Promise<Sucursal> {
    const sucursal = await this.r11Sucursal.findFirst({
      where: { R11Id: id, R11Coop_id: user.R12Coop_id }
    })

    if ( !sucursal ) throw new BadRequestException(`Sucursal con el id ${ id } no existe`)

    return sucursal
  }

  // update(id: number, updateSucursaleInput: UpdateSucursaleInput) {
  //   return `This action updates a #${id} sucursale`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} sucursale`;
  // }
}
