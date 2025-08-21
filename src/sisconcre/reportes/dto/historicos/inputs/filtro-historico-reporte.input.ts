// src/historico/dto/historico-filtro.input.ts
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';

export enum Fase {
  FASE_I = 'FASE_I',
  FASE_II = 'FASE_II',
  FASE_III = 'FASE_III',
  FASE_IV = 'FASE_IV',
}

export enum SubFaseIV {
  LEVANTAMIENTOS = 'LEVANTAMIENTOS',
  DESEMBOLSOS = 'DESEMBOLSOS',
}

// Registros para GraphQL
registerEnumType(Fase, { name: 'Fase' });
registerEnumType(SubFaseIV, { name: 'SubFaseIV' });


@InputType()
export class HistoricoFiltroInput extends FiltroFechasInput {
  @Field(() => Fase)
  @IsEnum(Fase)
  fase: Fase;

  @Field(() => SubFaseIV, { nullable: true })
  @IsOptional()
  @IsEnum(SubFaseIV)
  subFaseIV?: SubFaseIV;
}
