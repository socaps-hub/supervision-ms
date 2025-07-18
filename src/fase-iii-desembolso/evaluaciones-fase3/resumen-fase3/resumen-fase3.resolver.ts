import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';

import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionResumenFase3 } from './entities/resumen-fase3.entity';
import { ResumenFase3Service } from './resumen-fase3.service';
import { CreateEvaluacionResumenFase3Input } from './dtos/inputs/create-resumen-fase3.input';
import { UpdateEvaluacionResumenFase3Input } from './dtos/inputs/update-resumen-fase3.input';

@Resolver(() => EvaluacionResumenFase3)
@UseGuards(AuthGraphQLGuard)
export class ResumenFase3Resolver {

  constructor(private readonly resumenFase3Service: ResumenFase3Service) {}

  @Mutation(() => EvaluacionResumenFase3)
  createResumenFase3(
    @Args('createEvaluacionResumenFase3Input') input: CreateEvaluacionResumenFase3Input,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.resumenFase3Service.create(input, user);
  }

  @Query(() => [EvaluacionResumenFase3])
  resumenesFase3(
    @GetUserGraphQL() user: Usuario
  ) {
    return this.resumenFase3Service.findAll(user);
  }

  @Query(() => EvaluacionResumenFase3)
  resumenFase3ByPrestamo(
    @Args('R10P_num', { type: () => String }) R10P_num: string,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.resumenFase3Service.findOne(R10P_num, user);
  }

  @Mutation(() => EvaluacionResumenFase3)
  updateResumenFase3(
    @Args('R10P_num', { type: () => String }) R10P_num: string,
    @Args('updateEvaluacionResumenFase3Input') input: UpdateEvaluacionResumenFase3Input,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.resumenFase3Service.update(R10P_num, input, user);
  }

  @Mutation(() => Boolean)
  deleteByPrestamo(
    @Args('prestamoId', { type: () => String }) prestamoId: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase3Service.deleteByPrestamo(prestamoId, user);
  }
}
