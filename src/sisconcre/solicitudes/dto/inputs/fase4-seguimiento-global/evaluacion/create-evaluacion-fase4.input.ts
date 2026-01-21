import { InputType, Field, ID } from '@nestjs/graphql';
import { ResFaseII as ResFII } from '@prisma/client';
import { IsString } from 'class-validator';
import { ResFaseII } from 'src/sisconcre/solicitudes/enums/evaluacion-fase2.enum';

@InputType()
export class CreateEvaluacionFase4Input {  
  @Field(() => String)
  @IsString()
  R15E_id: string;
  
  @Field(() => ResFaseII)
  @IsString()
  R15Res: ResFII;
}
