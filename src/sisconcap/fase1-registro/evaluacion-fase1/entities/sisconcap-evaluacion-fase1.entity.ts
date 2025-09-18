import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { ResFaseI as ResF1 } from "@prisma/client";
import { ResFaseI } from "src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum";
import { Movimiento } from "src/sisconcap/movimientos/entities/movimiento.entity";

@ObjectType()
export class SisconcapEvaluacionFase1 {
    @Field(() => ID)
    R20Id: string;

    @Field(() => Int)
    R20Folio: number;

    @Field(() => String)
    R20E_id: string;

    @Field(() => ResFaseI)
    R20Res: ResF1;

    // Relación inversa
    @Field(() => Movimiento, { nullable: true })
    movimiento?: Movimiento;
}