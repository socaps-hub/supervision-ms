import { CreateSucursaleInput } from './create-sucursale.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSucursaleInput extends PartialType(CreateSucursaleInput) {
  @Field(() => Int)
  id: number;
}
