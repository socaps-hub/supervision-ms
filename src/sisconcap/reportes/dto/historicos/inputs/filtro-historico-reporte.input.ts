// src/historico/dto/historico-filtro.input.ts
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';

export enum SisconcapFaseOptions {
  FASE_I = 'FASE_I',
  FASE_II = 'FASE_II',
  FASE_III = 'FASE_III',
}

export enum MovimientoOptions {
  ACTUALIZACION = 'ACTUALIZACION',
  ALTA = 'ALTA',
  APERTURA = 'APERTURA',
  BAJA = 'BAJA',
  TODOS = 'TODOS',
}

// Registros para GraphQL
registerEnumType(SisconcapFaseOptions, { name: 'SisconcapFaseOptions' });
registerEnumType(MovimientoOptions, { name: 'MovimientoOptions' });


@InputType()
export class SisconcapHistoricoFiltroInput extends FiltroFechasInput {
  @Field(() => SisconcapFaseOptions)
  @IsEnum(SisconcapFaseOptions)
  fase: SisconcapFaseOptions;

  @Field(() => MovimientoOptions)
  @IsEnum(MovimientoOptions)
  movimiento: MovimientoOptions;
}
