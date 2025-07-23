import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsString } from "class-validator";
import { CreateEvaluacionResumenFase4Input } from "../../resumen-fase4/dto/inputs/create-evaluacion-resumen-fase4.input";
import { CreateEvaluacionFase4Input } from "../inputs/create-evaluacion-fase4.input";

@InputType()
export class SaveEvaluacionesFase4Args {

    @Field(() => [CreateEvaluacionFase4Input])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateEvaluacionFase4Input)
    evaluaciones: CreateEvaluacionFase4Input[]

    @Field(() => CreateEvaluacionResumenFase4Input)
    @ValidateNested()
    @Type(() => CreateEvaluacionResumenFase4Input)
    resumen: CreateEvaluacionResumenFase4Input
}
