import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSucursaleInput } from './dto/create-sucursale.input';
import { UpdateSucursaleInput } from './dto/update-sucursale.input';
import { Sucursal } from './entities/sucursal.entity';

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

  async findAll(): Promise<Sucursal[]> {
    return await this.r11Sucursal.findMany({})
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} sucursale`;
  // }

  // update(id: number, updateSucursaleInput: UpdateSucursaleInput) {
  //   return `This action updates a #${id} sucursale`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} sucursale`;
  // }
}
