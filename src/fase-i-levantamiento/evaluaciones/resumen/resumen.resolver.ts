import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { EvaluacionResumenFase1 } from './entities/resumen-fase1.entity';
import { CreateResumenFase1Input } from './dto/create-resumen-fase1.input';
import { UpdateResumenFase1Input } from './dto/update-resumen-fase1.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { ResumenFase1Service } from './resumen.service';
import { GetUserGraphQL } from '../../../common/decorators/user-graphql.decorator';

@Resolver(() => EvaluacionResumenFase1)
@UseGuards(AuthGraphQLGuard)
export class ResumenFase1Resolver {
  
  constructor(private readonly resumenFase1Service: ResumenFase1Service) {}

  @Mutation(() => EvaluacionResumenFase1)
  createResumenFase1(
    @Args('createResumenFase1Input') input: CreateResumenFase1Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase1Service.create(input, user);
  }

  @Query(() => [EvaluacionResumenFase1])
  resumenesFase1(
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase1Service.findAll(user);
  }

  @Query(() => EvaluacionResumenFase1)
  resumenFase1ByPrestamo(
    @Args('R06P_num', { type: () => String }) R06P_num: string,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase1Service.findOne(R06P_num, user);
  }

  @Mutation(() => EvaluacionResumenFase1)
  updateResumenFase1(
    @Args('R06P_num', { type: () => String }) R06P_num: string,
    @Args('updateResumenFase1Input') input: UpdateResumenFase1Input,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.resumenFase1Service.update(R06P_num, input, user);
  }
}
