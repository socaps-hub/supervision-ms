import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { EvaluacionFase2 } from './entities/evaluacion-fase2.entity';
import { EvaluacionesFase2Service } from './evaluaciones-fase2.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase2Input } from './dto/inputs/create-evaluacion-fase2.input';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { UpdateEvaluacionFase2Input } from './dto/inputs/update-evaluacion-fase2.input';

@Resolver(() => EvaluacionFase2)
@UseGuards(AuthGraphQLGuard)
export class EvaluacionesFase2Resolver {

  constructor(private readonly service: EvaluacionesFase2Service) {}

  @Mutation(() => Boolean)
  async createEvaluacionesFase2(
    @Args({ name: 'inputs', type: () => [CreateEvaluacionFase2Input] }) inputs: CreateEvaluacionFase2Input[],
    @GetUserGraphQL() user: Usuario,
  ): Promise<boolean> {
    return this.service.createMany(inputs, user);
  }

  @Query(() => [EvaluacionFase2], { name: 'evaluacionesFase2' })
  async findAllEvaluacionesFase2(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ): Promise<EvaluacionFase2[]> {
    return this.service.findAll(prestamoId, user);
  }

  @Mutation(() => EvaluacionFase2)
  async updateEvaluacionFase2(
    @Args('input') input: UpdateEvaluacionFase2Input,
    @GetUserGraphQL() user: Usuario,
  ): Promise<EvaluacionFase2> {
    return this.service.update(input.id, input, user);
  }

  @Mutation(() => Boolean)
  async deleteByPrestamo(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ): Promise<Boolean> {
    return this.service.deleteByPrestamo(prestamoId, user);
  }
}
