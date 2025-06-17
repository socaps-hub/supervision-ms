import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { GruposService } from './grupos.service';
import { Grupo } from './entities/grupo.entity';
import { CreateGrupoInput } from './dto/create-grupo.input';
import { UpdateGrupoInput } from './dto/update-grupo.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';

@Resolver(() => Grupo)
@UseGuards( AuthGraphQLGuard )
export class GruposResolver {
  constructor(private readonly gruposService: GruposService) {}

  @Mutation(() => Grupo, { name: 'createGrupo' })
  createGrupo(
    @Args('createGrupoInput') createGrupoInput: CreateGrupoInput
  ) {
    return this.gruposService.create(createGrupoInput)
  }

  @Query(() => [Grupo], { name: 'grupos' })
  findAll(
    @Args('coopId', { type: () => ID }, ParseUUIDPipe) coopId: string
  ) {
    return this.gruposService.findAll( coopId );
  }

  // @Query(() => Grupo, { name: 'grupo' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.gruposService.findOne(id);
  // }

  @Mutation(() => Grupo)
  updateGrupo(
    @Args('updateGrupoInput') updateGrupoInput: UpdateGrupoInput
  ) {
    return this.gruposService.update(updateGrupoInput.id, updateGrupoInput);
  }

  @Mutation(() => Grupo)
  removeGrupo(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.gruposService.remove(id);
  }
}
