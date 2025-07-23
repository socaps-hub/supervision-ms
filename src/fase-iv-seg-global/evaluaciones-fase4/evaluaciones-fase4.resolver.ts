import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { EvaluacionesFase4Service } from './evaluaciones-fase4.service';
import { EvaluacionFase4 } from './entities/evaluacion-fase4.entity';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase4Input } from './dto/inputs/create-evaluacion-fase4.input';
import { UpdateEvaluacionFase4Input } from './dto/inputs/update-evaluacion-fase4.input';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { CreateEvaluacionResumenFase4Input } from './resumen-fase4/dto/inputs/create-evaluacion-resumen-fase4.input';
import { SaveEvaluacionesFase4Args } from './dto/args/save-evaluaciones-fase4.args';

@Resolver(() => EvaluacionFase4)
@UseGuards(AuthGraphQLGuard)
export class EvaluacionesFase4Resolver {

  constructor(private readonly service: EvaluacionesFase4Service) { }

  @Mutation(() => BooleanResponse)
  async saveEvaluacionesFase4(
    @Args('saveEvaluacionesFase4Args') saveEvaluacionesFase4Args: SaveEvaluacionesFase4Args,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return this.service.saveEvaluacionesFase4(saveEvaluacionesFase4Args, user);
  }

  @Mutation(() => Boolean)
  async createEvaluacionesFase4(
    @Args('inputs', { type: () => [CreateEvaluacionFase4Input] }) inputs: CreateEvaluacionFase4Input[],
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.createMany(inputs, user);
  }

  @Query(() => [EvaluacionFase4])
  async evaluacionesFase4ByPrestamo(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.findAll(prestamoId, user);
  }

  @Mutation(() => EvaluacionFase4)
  async updateEvaluacionFase4(
    @Args('input') input: UpdateEvaluacionFase4Input,
  ) {
    return this.service.update(input.id, input);
  }

  @Mutation(() => Boolean)
  deleteEvaluacionesFase4ByPrestamo(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.deleteByPrestamo(prestamoId, user);
  }
}
