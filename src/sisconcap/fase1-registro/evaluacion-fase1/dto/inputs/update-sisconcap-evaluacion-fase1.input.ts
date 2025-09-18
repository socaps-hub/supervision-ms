import { InputType, Field, ID, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsString, IsUUID } from "class-validator";
import { CreateSisconcapEvaluacionFase1Input } from "./create-sisconcap-evaluacion-fase1.input";

@InputType()
export class UpdateSisconcapEvaluacionFase1Input extends PartialType(CreateSisconcapEvaluacionFase1Input) {
  @Field(() => ID)
  @IsUUID()
  R20Id: string;
}