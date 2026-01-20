import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { CreatePrestamoInput } from './create-solicitud.input';
import { IsString } from 'class-validator';

@InputType()
export class UpdatePrestamoInput extends PartialType(CreatePrestamoInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
