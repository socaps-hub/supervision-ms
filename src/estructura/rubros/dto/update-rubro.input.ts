import { IsUUID } from 'class-validator';
import { CreateRubroInput } from './create-rubro.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateRubroInput extends PartialType(CreateRubroInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
