import { InputType, Field, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Calificativo as Cal } from "@prisma/client";
import { Calificativo } from "src/sisconcre/solicitudes/enums/evaluacion.enum";

@InputType()
export class CreateSisconcapEvaluacionResumenFase3Input {
    @Field(() => Int)
    @IsNumber()
    R25Solv: number;

    @Field(() => Int)
    @IsNumber()
    R25PSolv: number;

    @Field(() => Int)
    @IsNumber()
    R25Rc: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    R25Obs?: string;

    @Field(() => String)
    @IsString()
    R25FSegG: string;

    @Field(() => Calificativo)
    @IsString()
    R25Cal: Cal;
}