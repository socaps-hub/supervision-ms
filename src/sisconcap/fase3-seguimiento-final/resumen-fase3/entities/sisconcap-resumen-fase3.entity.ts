import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Calificativo as Cal} from "@prisma/client";
import { Usuario } from "src/common/entities/usuario.entity";
import { Movimiento } from "src/sisconcap/movimientos/entities/movimiento.entity";
import { Calificativo } from "src/sisconcre/solicitudes/enums/evaluacion.enum";

@ObjectType()
export class SisconcapEvaluacionResumenFase3 {
    @Field(() => Int)
    R25Folio: number;

    @Field(() => Int)
    R25Solv: number;

    @Field(() => Int)
    R25PSolv: number;

    @Field(() => Int)
    R25Rc: number;

    @Field(() => String)
    R25Obs: string;

    @Field(() => Calificativo)
    R25Cal: Cal;

    @Field(() => String)
    R25FSegG: string;

    @Field(() => String)
    R25SP_id: string;

    // Relaciones
    @Field(() => Movimiento, { nullable: true })
    movimiento?: Movimiento;

    @Field(() => Usuario, { nullable: true })
    supervisor?: Usuario;
}