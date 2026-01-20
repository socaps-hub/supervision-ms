import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { CreatePrestamoInput } from '../solicitudes/create-solicitud.input';
import { CreateEvaluacionFase1Input } from './evaluacion/create-evaluacion-fase1.input';
import { CreateResumenFase1Input } from './resumen/create-resumen-fase1.input';

@InputType()
export class SisConCreCreateFase1Input {
  @Field(() => CreatePrestamoInput)
  @ValidateNested()
  @Type(() => CreatePrestamoInput)
  prestamo: CreatePrestamoInput;

  @Field(() => [CreateEvaluacionFase1Input])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluacionFase1Input)
  evaluaciones: CreateEvaluacionFase1Input[];

  @Field(() => CreateResumenFase1Input)
  @ValidateNested()
  @Type(() => CreateResumenFase1Input)
  resumen: CreateResumenFase1Input;
}
