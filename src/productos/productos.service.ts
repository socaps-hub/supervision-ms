import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductoInput } from './dto/create-producto.input';
import { UpdateProductoInput } from './dto/update-producto.input';
import { Producto } from './entities/producto.entity';
import { PrismaClient } from '@prisma/client';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CategoriasService } from 'src/categorias/categorias.service';

@Injectable()
export class ProductosService  extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('ProductosService')
  
  async onModuleInit() {
    await this.$connect();
    this._logger.log('Database connected')
  }

  constructor(
    private _categoriasService: CategoriasService
  ) {
    super()
  }
  
  async create( createProductoInput: CreateProductoInput, user: Usuario): Promise<Producto> {
    
    const { R13Nom, R13Cat_id } = createProductoInput

    await this._categoriasService.findOne( R13Cat_id )

    const product = await this.r13Producto.findFirst({
      where: {
        R13Coop_id: user.R12Coop_id,
        R13Nom
      }
    })

    if ( product ) throw new BadRequestException(`EL producto (${ R13Nom }) ya existe en tu cooperativa`)

    return await this.r13Producto.create({
      data: {
        ...createProductoInput,
        R13Activ: true,
        R13Coop_id: user.R12Coop_id,
      },
      include: {
        categoria: true
      }
    })    
  }

  async findAll(user: Usuario): Promise<Producto[]> {
    return await this.r13Producto.findMany({
      where: {
        R13Coop_id: user.R12Coop_id,
        R13Activ: true,
      },
      include: {
        categoria: true
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoInput: UpdateProductoInput) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
