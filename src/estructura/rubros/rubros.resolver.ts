import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { RubrosService } from './rubros.service';
import { Rubro } from './entities/rubro.entity';
import { CreateRubroInput } from './dto/create-rubro.input';
import { UpdateRubroInput } from './dto/update-rubro.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { CreateManyRubrosFromExcelArgs } from './dto/args/create-many-rubros-from-excel.arg';

@Resolver(() => Rubro)
@UseGuards( AuthGraphQLGuard )
export class RubrosResolver {
  constructor(private readonly rubrosService: RubrosService) {}

  @Mutation(() => Rubro)
  createRubro(
    @Args('createRubroInput') createRubroInput: CreateRubroInput
  ) {
    return this.rubrosService.create(createRubroInput);
  }

  @Query(() => [Rubro], { name: 'rubros' })
  findAll(
    @Args('coopId', ParseUUIDPipe) coopId: string
  ) {
    return this.rubrosService.findAll( coopId );
  }

  @Query(() => Rubro, { name: 'rubro' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.rubrosService.findById(id);
  }

  @Mutation(() => Rubro)
  updateRubro(
    @Args('updateRubroInput') updateRubroInput: UpdateRubroInput
  ) {
    return this.rubrosService.update(updateRubroInput.id, updateRubroInput);
  }

  @Mutation(() => Rubro)
  removeRubro(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
  ) {
    return this.rubrosService.remove(id);
  }

  @Mutation(() => BooleanResponse)
  createManyRubrosFromExcel(
    @Args('createManyRubrosFromExcelArgs') createManyRubrosFromExcelArgs: CreateManyRubrosFromExcelArgs,
  ) {
    return this.rubrosService.createManyFromExcel(createManyRubrosFromExcelArgs.data, createManyRubrosFromExcelArgs.coopId);
  }
}
