import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateFase1Input } from './dto/inputs/create-fase1.input';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { Movimiento } from './entities/movimiento.entity';
import { UpdateMovimientoArgs } from './dto/inputs/update-movimiento.input';

@Resolver()
@UseGuards(AuthGraphQLGuard)
export class MovimientosResolver {

  constructor(private readonly movimientosService: MovimientosService) {}

  @Mutation(() => BooleanResponse)
  async createFase1(
    @Args('input') input: CreateFase1Input,
    @GetUserGraphQL() user: Usuario,
  ) {

    const { movimiento, evaluaciones, resumen } = input;
    
    try {
      await this.movimientosService.createFase1(
        movimiento,
        evaluaciones,
        resumen,
        user,
      );

      return {
        success: true,
        message: 'Fase 1 creada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'No se pudo crear la Fase 1',
      };
    }

  }

  @Query(() => [Movimiento])
  async movimientos(
    @Args('filterBySucursal', { type: () => Boolean, nullable: true, defaultValue: true }) filterBySucursal: boolean,
    @GetUserGraphQL() user: Usuario,
  ) {
    return await this.movimientosService.findAll( user, filterBySucursal )
  }

  @Query(() => Movimiento)
  async movimiento(
    @Args('folio', ParseIntPipe) folio: number,
    @GetUserGraphQL() user: Usuario,
  ) {
    return this.movimientosService.findByFolio( folio, user )
  }

  @Mutation(() => BooleanResponse)
  async updateMovimientoF1(
    @Args('updateMovimientoArgs') updateMovimientoArgs: UpdateMovimientoArgs,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return await this.movimientosService.updateFase1( updateMovimientoArgs, user )
  }

  @Mutation(() => Movimiento)
  async removeMovimiento(
    @Args('folio', ParseIntPipe) folio: number,
    @GetUserGraphQL() user: Usuario,
  ) {
    return await this.movimientosService.remove(folio, user)
  }

}
