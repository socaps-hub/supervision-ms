import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { SolicitudesService } from './solicitudes.service';
import { CreatePrestamoInput } from './dto/create-solicitud.input';
import { UpdatePrestamoInput } from './dto/update-solicitud.input';
import { Usuario } from 'src/common/entities/usuario.entity';

import { mapR01ToPrestamo } from './mappers/prestamo.mapper';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { Prestamo } from './entities/solicitud.entity';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { plainToInstance } from 'class-transformer';
import { UpdateAllPrestamoArgs } from './dto/args/update-all-prestamo.arg';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';

@Resolver(() => Prestamo)
@UseGuards(AuthGraphQLGuard)
export class SolicitudesResolver {

  constructor(
    private readonly solicitudesService: SolicitudesService
  ) {}

  @Mutation(() => Prestamo)
  async createPrestamo(
    @Args('createPrestamoInput') createPrestamoInput: CreatePrestamoInput,
    @GetUserGraphQL() user: Usuario,
  ): Promise<Prestamo> {    
    const prestamo = await this.solicitudesService.create(createPrestamoInput, user);
    return mapR01ToPrestamo(prestamo);
  }

  @Query(() => [Prestamo])
  async prestamos(
    @GetUserGraphQL() user: Usuario,
  ): Promise<Prestamo[]> {
    const lista = await this.solicitudesService.findAll(user);
    return lista.map(mapR01ToPrestamo);
  }

  @Query(() => Prestamo)
  async prestamo(
    @Args('id') id: string,
    @GetUserGraphQL() user: Usuario,
  ): Promise<Prestamo> {
    const prestamo = await this.solicitudesService.findById(id, user);
    return mapR01ToPrestamo(prestamo);
  }

  @Mutation(() => Prestamo)
  async updatePrestamo(
    @Args('updatePrestamoInput') updatePrestamoInput: UpdatePrestamoInput,
    @GetUserGraphQL() user: Usuario,
  ): Promise<Prestamo> {
    const prestamo = await this.solicitudesService.update(updatePrestamoInput.id, updatePrestamoInput, user);
    return mapR01ToPrestamo(prestamo);
  }

  @Mutation(() => BooleanResponse)
  async updateAllPrestamo(
    @Args('updateAllPrestamoArgs') updateAllPrestamoArgs: UpdateAllPrestamoArgs,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return await this.solicitudesService.updateAll(updateAllPrestamoArgs, user)
  }

  @Mutation(() => Prestamo)
  async removePrestamo(
    @Args('R01NUM') id: string,
    @GetUserGraphQL() user: Usuario,
  ): Promise<Prestamo> {
    const prestamo = await this.solicitudesService.remove(id, user);
    return mapR01ToPrestamo(prestamo);
  }
}
