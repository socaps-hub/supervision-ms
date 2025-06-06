import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CategoriasService } from './categorias.service';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaArgs } from './dto/args/create-categoria.arg';

@Resolver(() => Categoria)
export class CategoriasResolver {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Mutation(() => Categoria)
  createCategoria(
    @Args() createCategoriaArgs: CreateCategoriaArgs,
  ) {
    return this.categoriasService.create(createCategoriaArgs);
  }

  @Query(() => [Categoria], { name: 'categorias' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Query(() => Categoria, { name: 'categoria' })
  findOne(
    @Args('id', { type: () => ID }) id: string
  ) {
    return this.categoriasService.findOne(id);
  }

  // @Mutation(() => Categoria)
  // updateCategoria(@Args('updateCategoriaInput') updateCategoriaInput: UpdateCategoriaInput) {
  //   return this.categoriasService.update(updateCategoriaInput.id, updateCategoriaInput);
  // }

  // @Mutation(() => Categoria)
  // removeCategoria(@Args('id', { type: () => Int }) id: number) {
  //   return this.categoriasService.remove(id);
  // }
}
