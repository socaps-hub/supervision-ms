import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CategoriasService } from './categorias.service';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaInput } from './dto/create-categoria.input';
import { UpdateCategoriaInput } from './dto/update-categoria.input';
import { UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/auth/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/auth/decorators/user-graphql.decorator';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Resolver(() => Categoria)
@UseGuards( AuthGraphQLGuard )
export class CategoriasResolver {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Mutation(() => Categoria)
  createCategoria(
    @Args('createCategoriaInput') createCategoriaInput: CreateCategoriaInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.categoriasService.create(createCategoriaInput, user);
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
