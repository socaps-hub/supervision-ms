import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { Producto } from './entities/producto.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CategoriasService } from 'src/categorias/categorias.service';
import { CreateProductArgs } from './dto/args/create-product.arg';
import { UpdateProductArgs } from './dto/args/update-product.arg';
import { ActivateProductArgs } from './dto/args/activate-product.arg';

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
  
  async create( createProductArgs: CreateProductArgs ): Promise<Producto> {

    const { createProductoInput, usuario } = createProductArgs    
    const { R13Nom, R13Cat_id } = createProductoInput

    await this._categoriasService.findOne( R13Cat_id )

    const product = await this.findByName( usuario, R13Nom )

    if ( product ) {
      
      if ( !product.R13Activ ) throw new BadRequestException(`El producto ${ R13Nom } esta desactivado`)

      throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
    }

    return await this.r13Producto.create({
      data: {
        ...createProductoInput,
        R13Nom: R13Nom.toLowerCase(),
        R13Activ: true,
        R13Coop_id: usuario.R12Coop_id,
      },
      include: {
        categoria: true
      }
    })    
  }

  async findAll(user: Usuario): Promise<Producto[]> {
    return await this.r13Producto.findMany({
      orderBy: {
        R13Creado_en: 'desc'
      },
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

  async findByName( user: Usuario , name?: string) {
    return await this.r13Producto.findFirst({
      where: {
        R13Coop_id: user.R12Coop_id,
        R13Nom: name?.toLowerCase().trim()
      }
    })
  }

  async update(updateProductoArgs: UpdateProductArgs) {

    const { updateProductoInput, usuario } = updateProductoArgs
    const { R13Cat_id, R13Nom, id } = updateProductoInput

    const productDB = await this.findByID( id )

    if ( R13Nom ) {
      const product = await this.findByName( usuario, R13Nom )
  
      if (product && product.R13Id !== id) {
        throw new BadRequestException(`El producto ${ R13Nom } ya existe en tu cooperativa`)
      }
    }

    return this.r13Producto.update({
      where: { R13Id: id },
      data: {
        R13Id: productDB.R13Id,
        R13Cat_id: R13Cat_id ? R13Cat_id : productDB.R13Cat_id,
        R13Nom: R13Nom ? R13Nom : productDB.R13Nom,
        R13Activ: productDB.R13Activ,
        R13Coop_id: productDB.R13Coop_id,
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

  async activate( activateProductArgs: ActivateProductArgs ) {

    const { name, usuario } = activateProductArgs

    const producto = await this.r13Producto.findFirst({
      where: { R13Nom: name , R13Coop_id: usuario.R12Coop_id },
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
