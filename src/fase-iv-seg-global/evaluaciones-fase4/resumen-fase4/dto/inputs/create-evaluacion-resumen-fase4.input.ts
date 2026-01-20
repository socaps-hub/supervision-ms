import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { Calificativo } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@InputType()
export class CreateEvaluacionResumenFase4Input {

    @Field(() => ID)
    @IsString()
    R16P_num: string;

    @Field(() => Int)
    @IsNumber()
    R16SolvT: number;

    @Field(() => Int)
    @IsNumber()
    R16SolvA: number;

    @Field(() => Int)
    @IsNumber()
    R16SolvM: number;

    @Field(() => Int)
    @IsNumber()
    R16SolvB: number;

    @Field(() => Calificativo)
    @IsString()
    R16SegCal: Cal;

    @Field(() => Int)
    @IsNumber()
    R16HaSolv: number;

    @Field(() => Int)
    @IsNumber()
    R16PenCu: number;

    @Field(() => Int)
    @IsNumber()
    R16RcF: number;

    @Field(() => Calificativo)
    @IsString()
    R16DesCal: Cal;

    @Field(() => Calificativo)
    @IsString()
    R16CalF: Cal;

    @Field(() => String)
    @IsString()
    R16Obs: string;

    @Field(() => String)
    @IsString()
    R16Ev_por: string;
}
