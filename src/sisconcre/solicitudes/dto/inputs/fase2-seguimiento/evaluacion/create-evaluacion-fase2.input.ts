import { InputType, Field } from '@nestjs/graphql';
import { ResFaseII as ResFII } from '@prisma/client';

import { IsString } from 'class-validator';
import { ResFaseII } from 'src/sisconcre/solicitudes/enums/evaluacion-fase2.enum';

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
