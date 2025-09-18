import { InputType, Field, ID, Int } from "@nestjs/graphql";
import { ResFaseI as ResF1 } from "@prisma/client";
import { IsInt, IsString } from "class-validator";
import { ResFaseI } from "src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum";

@InputType()
export class CreateSisconcapEvaluacionFase1Input {
  // @Field(() => Int)
  // @IsInt()
  // R20Folio: number;

  @Field(() => String)
  @IsString()
  R20E_id: string;
  
  @Field(() => ResFaseI)
  @IsString()
  R20Res: ResF1;
}