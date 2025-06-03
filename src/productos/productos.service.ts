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
        R13Nom: R13Nom.toLowerCase().trim()
      }
    })

    if ( product ) {
      
      if ( !product.R13Activ ) throw new BadRequestException(`El producto ${ R13Nom } esta desactivado`)

      throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
    }

    return await this.r13Producto.create({
      data: {
        ...createProductoInput,
        R13Nom: R13Nom.toLowerCase(),
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

  async findByID(id: string) {
    const producto = await this.r13Producto.findFirst({
      where: { R13Id: id },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })

    if ( !producto || !producto.R13Activ ) {
      throw new BadRequestException(`El producto con id ${ id } no existe`)
    }

    return producto
  }

  // update(id: number, updateProductoInput: UpdateProductoInput) {
  //   return `This action updates a #${id} producto`;
  // }

  async activate( name: string) {
    const producto = await this.r13Producto.findFirst({
      where: { R13Nom: name },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })

    if ( !producto ) {
      throw new BadRequestException(`El producto ${ name } no existe`)
    }
    producto.R13Activ = true

    return await this.r13Producto.update({
      where: { R13Id: producto.R13Id },
      data: {
        R13Id: producto.R13Id,
        R13Nom: producto.R13Nom,
        R13Cat_id: producto.R13Cat_id,
        R13Activ: producto.R13Activ,
        R13Coop_id: producto.R13Coop_id,
      },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })
  }

  async desactivate(id: string) {
    const producto = await this.findByID( id )
    producto.R13Activ = false

    return await this.r13Producto.update({
      where: { R13Id: id },
      data: {
        R13Id: producto.R13Id,
        R13Nom: producto.R13Nom,
        R13Cat_id: producto.R13Cat_id,
        R13Activ: producto.R13Activ,
        R13Coop_id: producto.R13Coop_id,
      },
      include: {
        categoria: {
          select: {
            R14Id: true,
            R14Nom: true,
            R14Activ: true
          }
        }
      }
    })
  }
}
