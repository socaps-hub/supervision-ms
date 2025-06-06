import { CreateCooperativaInput } from './create-cooperativa.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCooperativaInput extends PartialType(CreateCooperativaInput) {
  @Field(() => Int)
  id: number;
}
