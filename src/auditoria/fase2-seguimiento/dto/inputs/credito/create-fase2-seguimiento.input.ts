import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsNumber, IsArray, ValidateNested } from "class-validator";
import { CreateEvaluacionF2ACreditoInput } from "./create-evaluacion-f2-a-credito.input";
import { CreateEvaluacionResumenF2ACreditoInput } from "./create-evaluacion-resumen-f2-a-credito.input";

@InputType()
export class CreateFase2SeguimientoInput {
    @Field(() => Int)
    @IsNumber()
    id: number;

    @Field(() => [CreateEvaluacionF2ACreditoInput])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateEvaluacionF2ACreditoInput)
    evaluaciones: CreateEvaluacionF2ACreditoInput[];

    @Field(() => CreateEvaluacionResumenF2ACreditoInput)
    @ValidateNested()
    @Type(() => CreateEvaluacionResumenF2ACreditoInput)
    resumen: CreateEvaluacionResumenF2ACreditoInput;
}