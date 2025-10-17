import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuditoriaService } from './auditoria.service';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { AuditoriaResponse } from './dto/outputs/auditoria-response.output';
import { AuditoriaInput } from './dto/inputs/auditoria.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';

@Resolver()
@UseGuards(AuthGraphQLGuard)
export class AuditoriaResolver {

  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Mutation(() => [AuditoriaResponse])
  async validarPrestamosFromExcel(
    @Args({ name: 'data', type: () => [AuditoriaInput] }) data: AuditoriaInput[],
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.auditoriaService.validarPrestamosNoExistentes(data, user);
  }

}
