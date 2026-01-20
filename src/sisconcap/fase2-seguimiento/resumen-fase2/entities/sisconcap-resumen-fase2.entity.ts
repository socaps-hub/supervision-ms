import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Calificativo as Cal} from "@prisma/client";
import { Usuario } from "src/common/entities/usuario.entity";
import { Movimiento } from "src/sisconcap/movimientos/entities/movimiento.entity";
import { Calificativo } from "src/sisconcre/solicitudes/enums/evaluacion.enum";

@ObjectType()
export class SisconcapEvaluacionResumenFase2 {
    @Field(() => Int)
    R23Folio: number;

    @Field(() => Int)
    R23Solv: number;

    @Field(() => Int)
    R23PSolv: number;

    @Field(() => Int)
    R23Rc: number;

    @Field(() => String)
    R23Obs: string;

    @Field(() => Calificativo)
    R23Cal: Cal;

    @Field(() => String)
    R23FSeg: string;

    @Field(() => String)
    R23SP_id: string;

    // Relaciones
    @Field(() => Movimiento, { nullable: true })
    movimiento?: Movimiento;

    @Field(() => Usuario, { nullable: true })
    supervisor?: Usuario;
}