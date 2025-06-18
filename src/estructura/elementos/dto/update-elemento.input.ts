import { IsUUID } from 'class-validator';
import { CreateElementoInput } from './create-elemento.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateElementoInput extends PartialType(CreateElementoInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;

}
