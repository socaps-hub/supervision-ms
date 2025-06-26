import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { CreateEvaluacionFase1Input } from './dto/create-evaluacion-fase1.input';
import { UpdateEvaluacionFase1Input } from './dto/update-evaluacion-fase1.input';
import { EvaluacionFase1 } from './entities/evaluacion-fase1.entity';
import { EvaluacionesFase1Service } from './evaluaciones-fase1.service';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';

@Resolver(() => EvaluacionFase1)
@UseGuards(AuthGraphQLGuard)
export class EvaluacionesFase1Resolver {
  constructor(
    private readonly evaluacionesService: EvaluacionesFase1Service,
  ) {}

  @Mutation(() => EvaluacionFase1)
  async createEvaluacionFase1(
    @Args('createEvaluacionFase1Input') input: CreateEvaluacionFase1Input,
    @GetUserGraphQL() user: Usuario,
  ): Promise<EvaluacionFase1> {
    return this.evaluacionesService.create(input, user);
  }

  @Query(() => [EvaluacionFase1], { name: 'evaluacionesFase1' })
  async findAllEvaluacionesFase1(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ): Promise<EvaluacionFase1[]> {
    return this.evaluacionesService.findAll( prestamoId, user );
  }

  @Mutation(() => EvaluacionFase1)
  async updateEvaluacionFase1(
    @Args('updateEvaluacionFase1Input') input: UpdateEvaluacionFase1Input,
    @GetUserGraphQL() user: Usuario,
  ): Promise<EvaluacionFase1> {
    return this.evaluacionesService.update( input.id, input, user );
  }
}
