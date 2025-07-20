import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { EvaluacionResumenFase4 } from './entities/resumen-fase4.entity';
import { CreateEvaluacionResumenFase4Input } from './dto/inputs/create-evaluacion-resumen-fase4.input';
import { UpdateEvaluacionResumenFase4Input } from './dto/inputs/update-evaluacion-resumen-fase4.input';
import { ResumenFase4Service } from './resumen-fase4.service';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { Usuario } from 'src/common/entities/usuario.entity';

@Resolver(() => EvaluacionResumenFase4)
@UseGuards(AuthGraphQLGuard)
export class ResumenFase4Resolver {

  constructor(private readonly resumenFase4Service: ResumenFase4Service) {}

  @Mutation(() => EvaluacionResumenFase4)
  createResumenFase4(
    @Args('createResumenFase4Input') input: CreateEvaluacionResumenFase4Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase4Service.create(input, user);
  }

  @Query(() => [EvaluacionResumenFase4])
  resumenesFase4(
    @GetUserGraphQL() user: Usuario
  ) {
    return this.resumenFase4Service.findAll(user);
  }

  @Query(() => EvaluacionResumenFase4)
  resumenFase4ByPrestamo(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase4Service.findOne(prestamoId, user);
  }

  @Mutation(() => EvaluacionResumenFase4)
  updateResumenFase4(
    @Args('prestamoId', { type: () => ID }) prestamoId: string,
    @Args('updateResumenFase4Input') input: UpdateEvaluacionResumenFase4Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase4Service.update(prestamoId, input, user);
  }

  @Mutation(() => Boolean)
  deleteByPrestamo(
    @Args('prestamoId', { type: () => String }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase4Service.deleteByPrestamo(prestamoId, user);
  }
}
