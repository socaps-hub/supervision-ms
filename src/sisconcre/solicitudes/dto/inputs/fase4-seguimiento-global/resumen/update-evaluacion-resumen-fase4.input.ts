import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateEvaluacionResumenFase4Input } from './create-evaluacion-resumen-fase4.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateEvaluacionResumenFase4Input extends PartialType(CreateEvaluacionResumenFase4Input) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
