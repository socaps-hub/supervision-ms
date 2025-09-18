import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Calificativo as Cal} from "@prisma/client";
import { Usuario } from "src/common/entities/usuario.entity";
import { Calificativo } from "src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum";
import { Movimiento } from "src/sisconcap/movimientos/entities/movimiento.entity";

@ObjectType()
export class SisconcapEvaluacionResumenFase1 {
    @Field(() => Int)
    R21Folio: number;

    @Field(() => Int)
    R21Ha: number;

    @Field(() => Int)
    R21Rc: number;

    @Field(() => Calificativo)
    R21Cal: Cal;

    @Field(() => String)
    R21Obs: string;

    @Field(() => String)
    R21Ejvo_id: string;

    @Field(() => String)
    R21SP_id: string;

    // Relaciones
    @Field(() => Movimiento, { nullable: true })
    movimiento?: Movimiento;

    @Field(() => Usuario, { nullable: true })
    supervisor?: Usuario;

    @Field(() => Usuario, { nullable: true })
    ejecutivo?: Usuario;
}