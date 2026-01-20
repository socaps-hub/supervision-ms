import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateEvaluacionResumenFase2Input } from './create-evaluacion-resumen-fase2.input';

@InputType()
export class UpdateEvaluacionResumenFase2Input extends PartialType(CreateEvaluacionResumenFase2Input) {
  @Field(() => ID)
  @IsString()
  id: string;
}
