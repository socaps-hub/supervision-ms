import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { Calificativo, Resolucion } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@InputType()
export class CreateEvaluacionResumenFase2Input {
    @Field(() => Int)
    @IsNumber()
    R08SolvT: number;
    
    @Field(() => Int)
    @IsNumber()
    R08SolvA: number;
    
    @Field(() => Int)
    @IsNumber()
    R08SolvM: number;
    
    @Field(() => Int)
    @IsNumber()
    R08SolvB: number;
    
    @Field(() => Int)
    @IsNumber()
    R08Rc: number;

    @Field(() => Calificativo)
    @IsString()
    R08Cal: Cal;
    
    @Field(() => Resolucion)
    @IsString()
    R08Res: Res;

    @Field(() => String)
    @IsString()
    R08Obs: string;
}
