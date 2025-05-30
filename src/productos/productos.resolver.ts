import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { CreateProductoInput } from './dto/create-producto.input';
import { UpdateProductoInput } from './dto/update-producto.input';

@Resolver(() => Producto)
export class ProductosResolver {
  constructor(private readonly productosService: ProductosService) {}

  @Mutation(() => Producto)
  createProducto(
    @Args('createProductoInput') createProductoInput: CreateProductoInput
  ) {
    return createProductoInput
    // return this.productosService.create(createProductoInput);
  }

  @Query(() => [Producto], { name: 'productos' })
  findAll() {
    return this.productosService.findAll();
  }

  @Query(() => Producto, { name: 'producto' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productosService.findOne(id);
  }

  @Mutation(() => Producto)
  updateProducto(@Args('updateProductoInput') updateProductoInput: UpdateProductoInput) {
    return this.productosService.update(updateProductoInput.id, updateProductoInput);
  }

  @Mutation(() => Producto)
  removeProducto(@Args('id', { type: () => Int }) id: number) {
    return this.productosService.remove(id);
  }
}
