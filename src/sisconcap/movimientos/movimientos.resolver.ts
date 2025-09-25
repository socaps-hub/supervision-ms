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
import { CreateFase2Input } from './dto/inputs/create-fase2.input';
import { ValidEstadosArgs } from 'src/fase-i-levantamiento/solicitudes/dto/args/prestamos-by-estado.arg';
import { CreateFase3Input } from './dto/inputs/create-fase3.input';

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

  @Mutation(() => BooleanResponse)
  async createOrUpdateFase2(
    @Args('input') input: CreateFase2Input,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return await this.movimientosService.createOrUpdateFase2( input, user )
  }

  @Mutation(() => BooleanResponse)
  async createOrUpdateFase3(
    @Args('input') input: CreateFase3Input,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return await this.movimientosService.createOrUpdateFase3( input, user )
  }

  @Query(() => [Movimiento])
  async movimientos(
    @Args('filterBySucursal', { type: () => Boolean, nullable: true, defaultValue: true }) filterBySucursal: boolean,
    @GetUserGraphQL() user: Usuario,
  ) {
    return await this.movimientosService.findAll( user, filterBySucursal )
  }

  @Query(() => [Movimiento])
  async movimientosByEstado(
    @Args() args: ValidEstadosArgs,
    @GetUserGraphQL() user: Usuario,
  ) {
    return await this.movimientosService.findByEstado( args.estado, user, args.filterBySucursal )
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

  @Mutation(() => BooleanResponse)
  async cancelFase3AndFase2(
    @Args('folio', ParseIntPipe) folio: number,
    @GetUserGraphQL() user: Usuario,
  ): Promise<BooleanResponse> {
    return await this.movimientosService.cancelFase3AndFase2( folio, user )
  }

}
