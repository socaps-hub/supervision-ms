import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ResFaseII as ResFII } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { Elemento } from 'src/estructura/elementos/entities/elemento.entity';
import { Prestamo } from 'src/sisconcre/solicitudes/entities/solicitud.entity';
import { ResFaseII } from '../../enums/evaluacion-fase2.enum';

@ObjectType()
export class EvaluacionFase2 {

    @Field(() => ID)
    R07Id: string;

    @Field(() => String)
    R07P_num: string;
    
    @Field(() => String)
    R07E_id: string;

    @Field(() => ResFaseII)
    R07Res: ResFII;

    @Field(() => String)
    R07Ev_por: string;

    @Field(() => String)
    R07Ev_en: string;

    // Relaciones
    @Field(() => Elemento, { nullable: true })
    elemento?: Elemento;

    @Field(() => Usuario, { nullable: true })
    evaluador?: Usuario;

    @Field(() => Prestamo, { nullable: true })
    prestamo?: Prestamo;
}
