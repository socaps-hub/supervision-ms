import { IsString, IsUUID } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';
import { ResFaseI as ResFI } from '@prisma/client';
import { ResFaseI } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@InputType()
export class CreateEvaluacionFase1Input {

  // @Field(() => ID)
  // @IsString()
  // R05P_num: string;

  @Field(() => ID)
  @IsUUID()
  R05E_id: string;

  @Field(() => ResFaseI)
  @IsString()
  R05Res: ResFI;

  // El evaluador (R05Ev_por) y la fecha (R05Ev_en) se pueden asignar en el backend con el current user y Date.now()
}
