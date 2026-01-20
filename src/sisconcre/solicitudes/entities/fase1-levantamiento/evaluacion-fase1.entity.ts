import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ResFaseI as ResFI } from '@prisma/client';

import { Elemento } from 'src/estructura/elementos/entities/elemento.entity';
import { Usuario } from 'src/common/entities/usuario.entity';
import { ResFaseI } from '../../enums/evaluacion.enum';
import { Prestamo } from '../solicitud.entity';
// import { ResFaseI } from '@prisma/client';

@ObjectType()
export class EvaluacionFase1 {
  @Field(() => ID)
  R05Id: string;

  @Field(() => String)
  R05P_num: string;

  @Field(() => String)
  R05E_id: string;

  @Field(() => ResFaseI)
  R05Res: ResFI;

  @Field(() => String)
  R05Ev_por: string;

  @Field(() => String)
  R05Ev_en: string;

  // Relaciones
  @Field(() => Elemento, { nullable: true })
  elemento?: Elemento;

  @Field(() => Usuario, { nullable: true })
  evaluador?: Usuario;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;
}
