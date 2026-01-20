import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { CreateEvaluacionFase1Input } from './create-evaluacion-fase1.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateEvaluacionFase1Input  extends PartialType(CreateEvaluacionFase1Input) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
