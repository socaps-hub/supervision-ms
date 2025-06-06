import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaArgs } from './dto/args/create-categoria.arg';

@Injectable()
export class CategoriasService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('CategoriasService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  async create(createCategoriaArgs: CreateCategoriaArgs): Promise<Categoria> {

    const { createCategoriaInput, usuario } = createCategoriaArgs
    const { R14Nom } = createCategoriaInput

    const categoria = await this.r14Categoria.findFirst({
      where: { R14Nom }
    })

    if ( categoria ) throw new BadRequestException(`Categoria (${ R14Nom }) ya existe`)

    return await this.r14Categoria.create({
      data: {
        R14Nom,
        R14Coop_id: usuario.R12Coop_id,
        R14Activ: true
      }
    })
  }

  async findAll(): Promise<Categoria[]> {
    return await this.r14Categoria.findMany({});
  }

  async findOne(id: string): Promise<Categoria> {
    
    const categoria = await this.r14Categoria.findFirst({
      where: { R14Id: id }
    })

    if ( !categoria ) throw new NotFoundException(`Categoría con id ${ id } no existe`)

    return categoria
  }

  // update(id: number, updateCategoriaInput: UpdateCategoriaInput) {
  //   return `This action updates a #${id} categoria`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} categoria`;
  // }
}
