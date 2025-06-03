import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { CreateProductoInput } from './dto/create-producto.input';
import { UpdateProductoInput } from './dto/update-producto.input';
import { AuthGraphQLGuard } from 'src/auth/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/auth/decorators/user-graphql.decorator';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Resolver(() => Producto)
@UseGuards( AuthGraphQLGuard )
export class ProductosResolver {
  constructor(private readonly productosService: ProductosService) {}

  @Mutation(() => Producto)
  createProducto(
    @Args('createProductoInput') createProductoInput: CreateProductoInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.create(createProductoInput, user);
  }

  @Query(() => [Producto], { name: 'productos' })
  findAll(
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.findAll(user);
  }

  // @Query(() => Producto, { name: 'producto' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.productosService.findOne(id);
  // }

  @Mutation(() => Producto)
  updateProducto(
    @Args('updateProductoInput') updateProductoInput: UpdateProductoInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.update(updateProductoInput.id, updateProductoInput, user);
  }

  @Mutation(() => Producto)
  activateProducto(
    @Args('name', { type: () => String }) name: string,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.productosService.activate(name, user);
  }

  @Mutation(() => Producto)
  desactivateProducto(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.productosService.desactivate(id);
  }
}
