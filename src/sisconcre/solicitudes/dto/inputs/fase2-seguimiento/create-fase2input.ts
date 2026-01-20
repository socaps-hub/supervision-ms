import { Type } from 'class-transformer';
import { IsArray, IsString, Length, ValidateNested } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { CreateEvaluacionFase2Input } from './evaluacion/create-evaluacion-fase2.input';
import { CreateEvaluacionResumenFase2Input } from './resumen/create-evaluacion-resumen-fase2.input';

@InputType()
export class SisConCreCreateFase2Input {
  @Field(() => String)
  @Length(8, 8)
  @IsString()
  prestamo: string;

  @Field(() => [CreateEvaluacionFase2Input])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluacionFase2Input)
  evaluaciones: CreateEvaluacionFase2Input[];

  @Field(() => CreateEvaluacionResumenFase2Input)
  @ValidateNested()
  @Type(() => CreateEvaluacionResumenFase2Input)
  resumen: CreateEvaluacionResumenFase2Input;
}
