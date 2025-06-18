import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Elemento } from './entities/elemento.entity';
import { CreateElementoInput } from './dto/create-elemento.input';
import { UpdateElementoInput } from './dto/update-elemento.input';
import { ElementosService } from './elementos.service';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';

@Resolver(() => Elemento)
@UseGuards(AuthGraphQLGuard)
export class ElementosResolver {
  constructor(
    private readonly elementosService: ElementosService
  ) {}

  @Mutation(() => Elemento)
  createElemento(
    @Args('createElementoInput') createElementoInput: CreateElementoInput,
  ) {
    return this.elementosService.create(createElementoInput);
  }

  @Query(() => [Elemento], { name: 'elementosPorRubro' })
  findAll(
    @Args('rubroId', { type: () => ID }, ParseUUIDPipe) rubroId: string
  ) {
    return this.elementosService.findAll(rubroId);
  }

  @Query(() => Elemento, { name: 'elemento' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.elementosService.findById(id);
  }

  @Mutation(() => Elemento)
  updateElemento(
    @Args('updateElementoInput') updateElementoInput: UpdateElementoInput
  ) {
    return this.elementosService.update(updateElementoInput.id, updateElementoInput);
  }

  @Mutation(() => Elemento)
  removeElemento(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.elementosService.remove(id);
  }
}
