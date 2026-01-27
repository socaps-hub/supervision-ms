import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested, IsArray, IsString, Length, IsUUID } from "class-validator";
import { CreateEvaluacionFase4Input } from "./evaluacion/create-evaluacion-fase4.input";
import { CreateEvaluacionResumenFase4Input } from "./resumen/create-evaluacion-resumen-fase4.input";

@InputType()
export class SisConCreCreateFase4Input {

    @Field(() => ID)
    @IsUUID()
    prestamoId: string;

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
