import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsNumber, IsArray, ValidateNested } from "class-validator";
import { CreateEvaluacionF1ACreditoInput } from "./create-evaluacion-f1-a-credito.input";
import { CreateEvaluacionResumenF1ACreditoInput } from "./create-evaluacion-resumen-f1-a-credito.input";

@InputType()
export class CreateFase1RevisionInput {
    @Field(() => Int)
    @IsNumber()
    id: number;

    @Field(() => [CreateEvaluacionF1ACreditoInput])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateEvaluacionF1ACreditoInput)
    evaluaciones: CreateEvaluacionF1ACreditoInput[];

    @Field(() => CreateEvaluacionResumenF1ACreditoInput)
    @ValidateNested()
    @Type(() => CreateEvaluacionResumenF1ACreditoInput)
    resumen: CreateEvaluacionResumenF1ACreditoInput;
}