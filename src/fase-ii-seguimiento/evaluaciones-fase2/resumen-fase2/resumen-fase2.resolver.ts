import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { Usuario } from 'src/common/entities/usuario.entity';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { ResumenFase2Service } from './resumen-fase2.service';
import { EvaluacionResumenFase2 } from './entities/evaluacion-resumen-fase2.entity';
import { CreateEvaluacionResumenFase2Input } from './dto/inputs/create-evaluacion-resumen-fase2.input';
import { UpdateEvaluacionResumenFase2Input } from './dto/inputs/update-evaluacion-resumen-fase2.input';

@Resolver(() => EvaluacionResumenFase2)
@UseGuards(AuthGraphQLGuard)
export class ResumenFase2Resolver {
  
  constructor(private readonly resumenFase2Service: ResumenFase2Service) {}

  @Mutation(() => EvaluacionResumenFase2)
  createResumenFase2(
    @Args('createEvaluacionResumenFase2Input') input: CreateEvaluacionResumenFase2Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase2Service.create(input, user);
  }

  @Query(() => [EvaluacionResumenFase2])
  resumenesFase2(
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase2Service.findAll(user);
  }

  @Query(() => EvaluacionResumenFase2)
  resumenFase2ByPrestamo(
    @Args('R08P_num', { type: () => String }) R08P_num: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase2Service.findOne(R08P_num, user);
  }

  @Mutation(() => EvaluacionResumenFase2)
  updateResumenFase2(
    @Args('R08P_num', { type: () => String }) R08P_num: string,
    @Args('updateEvaluacionResumenFase2Input') input: UpdateEvaluacionResumenFase2Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase2Service.update(R08P_num, input, user);
  }

  @Mutation(() => Boolean)
  deleteByPrestamo(
    @Args('prestamoId', { type: () => String }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase2Service.deleteByPrestamo(prestamoId, user);
  }
}
