import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsString } from "class-validator";

import { UpdatePrestamoInput } from "../update-solicitud.input";
import { CreateEvaluacionFase1Input } from "src/fase-i-levantamiento/evaluaciones/dto/create-evaluacion-fase1.input";
import { CreateResumenFase1Input } from "src/fase-i-levantamiento/evaluaciones/resumen/dto/create-resumen-fase1.input";

@InputType()
export class UpdateAllPrestamoArgs {
  
  @Field(() => ID)
  @IsString()
  currentId: string

  @Field(() => UpdatePrestamoInput)
  @ValidateNested()
  @Type(() => UpdatePrestamoInput)
  prestamo: UpdatePrestamoInput;

  @Field(() => [CreateEvaluacionFase1Input])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEvaluacionFase1Input)
  evaluaciones: CreateEvaluacionFase1Input[];

  @Field(() => CreateResumenFase1Input)
  @ValidateNested()
  @Type(() => CreateResumenFase1Input)
  resumen: CreateResumenFase1Input;
}
