import { IsNumber, IsString, IsUUID } from 'class-validator';
import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { ResFaseI as ResF1 } from '@prisma/client';
import { ResFaseI } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';

@InputType()
export class CreateEvaluacionF1ACreditoInput {
  @Field(() => ID)
  @IsUUID()
  A03E_id: string;

  @Field(() => ResFaseI)
  @IsString()
  A03Res: ResF1;
}
