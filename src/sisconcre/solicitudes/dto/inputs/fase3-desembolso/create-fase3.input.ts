import { Type } from 'class-transformer';
import { IsArray, IsString, Length, ValidateNested } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { CreateEvaluacionFase3Input } from './evaluacion/create-evaluacion-fase3.input';
import { CreateEvaluacionResumenFase3Input } from './resumen/create-resumen-fase3.input';

@InputType()
export class SisConCreCreateFase3Input {
  @Field(() => String)
  @Length(8, 8)
  @IsString()
  prestamo: string;

  @Field(() => [CreateEvaluacionFase3Input])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluacionFase3Input)
  evaluaciones: CreateEvaluacionFase3Input[];

  @Field(() => CreateEvaluacionResumenFase3Input)
  @ValidateNested()
  @Type(() => CreateEvaluacionResumenFase3Input)
  resumen: CreateEvaluacionResumenFase3Input;
}
