import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateEvaluacionFase3Input } from './create-evaluacion-fase3.input';

@InputType()
export class UpdateEvaluacionFase3Input  extends PartialType(CreateEvaluacionFase3Input) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
