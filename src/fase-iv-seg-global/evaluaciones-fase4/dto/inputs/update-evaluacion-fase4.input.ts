import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateEvaluacionFase4Input } from './create-evaluacion-fase4.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateEvaluacionFase4Input extends PartialType(CreateEvaluacionFase4Input) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
