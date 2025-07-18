import { InputType, Field } from '@nestjs/graphql';
import { ResFaseIII as ResFIII } from '@prisma/client';
import { ResFaseIII } from '../../enums/evaluacion-fase3.enum';
import { IsString } from 'class-validator';

@InputType()
export class CreateEvaluacionFase3Input {
  @Field()
  @IsString()
  R09P_num: string;
  
  @Field()
  @IsString()
  R09E_id: string;
  
  @Field(() => ResFaseIII)
  @IsString()
  R09Res: ResFIII;
}
