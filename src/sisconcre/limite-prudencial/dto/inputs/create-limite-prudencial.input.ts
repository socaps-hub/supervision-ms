import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNumber, Min } from 'class-validator';

@InputType()
export class CreateLimitePrudencialInput {

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  R18Importe: number;

}
