import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { EvaluacionFase3 } from './entities/evaluacion-fase3.entity';
import { CreateEvaluacionFase3Input } from './dto/inputs/create-evaluacion-fase3.input';
import { UpdateEvaluacionFase3Input } from './dto/inputs/update-evaluacion-fase3.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { EvaluacionesFase3Service } from './evaluaciones-fase3.service';

@Resolver(() => EvaluacionFase3)
@UseGuards(AuthGraphQLGuard)
export class EvaluacionesFase3Resolver {

  constructor(private readonly service: EvaluacionesFase3Service) {}

  @Mutation(() => Boolean)
  createEvaluacionesFase3(
    @Args('inputs', { type: () => [CreateEvaluacionFase3Input] }) inputs: CreateEvaluacionFase3Input[],
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.createMany(inputs, user);
  }

  @Query(() => [EvaluacionFase3])
  evaluacionesFase3(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.findAll(prestamoId, user);
  }

  @Mutation(() => EvaluacionFase3)
  updateEvaluacionFase3(
    @Args('input') input: UpdateEvaluacionFase3Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.update(input.id, input, user);
  }

  @Mutation(() => Boolean)
  deleteEvaluacionesFase3ByPrestamo(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.service.deleteByPrestamo(prestamoId, user);
  }
}
