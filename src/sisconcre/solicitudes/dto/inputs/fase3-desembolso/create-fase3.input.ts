import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';
import { CreateEvaluacionFase3Input } from './evaluacion/create-evaluacion-fase3.input';
import { CreateEvaluacionResumenFase3Input } from './resumen/create-resumen-fase3.input';

@InputType()
export class SisConCreCreateFase3Input {
  @Field(() => ID)
  @IsUUID()
  prestamoId: string;

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
