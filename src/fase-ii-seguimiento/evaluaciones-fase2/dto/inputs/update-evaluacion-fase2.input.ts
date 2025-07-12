import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateEvaluacionFase2Input } from './create-evaluacion-fase2.input';

@InputType()
export class UpdateEvaluacionFase2Input  extends PartialType(CreateEvaluacionFase2Input) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
