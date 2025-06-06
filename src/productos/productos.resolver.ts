import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CreateProductArgs } from './dto/args/create-product.arg';
import { UpdateProductArgs } from './dto/args/update-product.arg';
import { ActivateProductArgs } from './dto/args/activate-product.arg';

@Resolver(() => Producto)
export class ProductosResolver {
  constructor(private readonly productosService: ProductosService) {}

  @Mutation(() => Producto)
  createProducto(
    @Args() createProductArgs: CreateProductArgs
  ) {
    return this.productosService.create(createProductArgs);
  }

  @Query(() => [Producto], { name: 'productos' })
  findAll(
    @Args() user: Usuario
  ) {
    return this.productosService.findAll(user);
  }

  // @Query(() => Producto, { name: 'producto' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.productosService.findOne(id);
  // }

  @Mutation(() => Producto)
  updateProducto(
    @Args() updateProductoArgs: UpdateProductArgs
  ) {
    return this.productosService.update(updateProductoArgs);
  }

  @Mutation(() => Producto)
  activateProducto(
    @Args() activateProductArgs: ActivateProductArgs
  ) {
    return this.productosService.activate(activateProductArgs);
  }

  @Mutation(() => Producto)
  desactivateProducto(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.productosService.desactivate(id);
  }
}
