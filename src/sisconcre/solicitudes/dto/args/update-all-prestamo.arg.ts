import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsString } from "class-validator";
import { CreateEvaluacionFase1Input } from "../inputs/fase1-levantamiento/evaluacion/create-evaluacion-fase1.input";
import { CreateResumenFase1Input } from "../inputs/fase1-levantamiento/resumen/create-resumen-fase1.input";
import { UpdatePrestamoInput } from "../inputs/solicitudes/update-solicitud.input";


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
