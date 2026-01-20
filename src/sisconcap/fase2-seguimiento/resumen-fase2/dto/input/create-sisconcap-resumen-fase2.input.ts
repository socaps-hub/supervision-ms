import { InputType, Field, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Calificativo as Cal } from "@prisma/client";
import { Calificativo } from "src/sisconcre/solicitudes/enums/evaluacion.enum";

@InputType()
export class CreateSisconcapEvaluacionResumenFase2Input {
    @Field(() => Int)
    @IsNumber()
    R23Solv: number;

    @Field(() => Int)
    @IsNumber()
    R23PSolv: number;

    @Field(() => Int)
    @IsNumber()
    R23Rc: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    R23Obs?: string;

    @Field(() => String)
    @IsString()
    R23FSeg: string;

    @Field(() => Calificativo)
    @IsString()
    R23Cal: Cal;
}