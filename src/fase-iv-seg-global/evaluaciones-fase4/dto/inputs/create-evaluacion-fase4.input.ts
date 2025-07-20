import { InputType, Field, ID } from '@nestjs/graphql';
import { ResFaseII as ResFII } from '@prisma/client';
import { IsString } from 'class-validator';
import { ResFaseII } from 'src/fase-ii-seguimiento/evaluaciones-fase2/enums/evaluacion-fase2.enum';

@InputType()
export class CreateEvaluacionFase4Input {
  @Field(() => ID)
  @IsString()
  R15P_num: string;
  
  @Field(() => String)
  @IsString()
  R15E_id: string;
  
  @Field(() => ResFaseII)
  @IsString()
  R15Res: ResFII;
}
