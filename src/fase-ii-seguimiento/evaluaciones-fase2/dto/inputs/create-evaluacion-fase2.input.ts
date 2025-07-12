import { InputType, Field } from '@nestjs/graphql';
import { ResFaseII as ResFII } from '@prisma/client';

import { ResFaseII } from '../../enums/evaluacion-fase2.enum';
import { IsString } from 'class-validator';

@InputType()
export class CreateEvaluacionFase2Input {

  @Field()
  @IsString()
  R07P_num: string;
  
  @Field()
  @IsString()
  R07E_id: string;
  
  @Field(() => ResFaseII)
  @IsString()
  R07Res: ResFII;

}
