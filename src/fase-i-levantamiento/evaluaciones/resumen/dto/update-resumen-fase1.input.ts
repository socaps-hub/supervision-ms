import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { CreateResumenFase1Input } from './create-resumen-fase1.input';
import { IsString } from 'class-validator';

@InputType()
export class UpdateResumenFase1Input extends PartialType(CreateResumenFase1Input) {
  @Field(() => ID)
  @IsString()
  id: string;
}
