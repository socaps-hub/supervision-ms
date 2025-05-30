import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCooperativaInput } from './dto/create-cooperativa.input';
import { UpdateCooperativaInput } from './dto/update-cooperativa.input';
import { PrismaClient } from '@prisma/client';
import { Cooperativa } from './entities/cooperativa.entity';

@Injectable()
export class CooperativasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('CooperativasService')

  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  // create(createCooperativaInput: CreateCooperativaInput) {
  //   return 'This action adds a new cooperativa';
  // }

  async findAll(): Promise<Cooperativa[]> {
    return await this.r17Cooperativas.findMany({
      include: {
        sucursales: true
      }
    });
  }

  async findOne(id: string): Promise<Cooperativa> {
    const cooperativa = await this.r17Cooperativas.findFirst({
      where: { R17Id: id },
      include: {
        sucursales: true
      }
    })

    if ( !cooperativa ) throw new BadRequestException(`Cooperativa con el id ${ id } no existe`)

    return cooperativa
  }

  // update(id: number, updateCooperativaInput: UpdateCooperativaInput) {
  //   return `This action updates a #${id} cooperativa`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} cooperativa`;
  // }
}
