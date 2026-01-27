import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { Calificativo, Resolucion } from '../../enums/evaluacion.enum';
import { Usuario } from 'src/common/entities/usuario.entity';
import { Prestamo } from '../solicitud.entity';

@ObjectType()
export class EvaluacionResumenFase1 {
  @Field(() => ID)
  R06Id: string;

  @Field(() => String)
  R06P_id: string;

  @Field(() => Int)
  R06Ha: number;

  @Field(() => Int)
  R06Hm: number;

  @Field(() => Int)
  R06Hb: number;

  @Field(() => Int)
  R06Rc: number;

  @Field(() => Calificativo)
  R06Cal: Cal;

  @Field(() => Resolucion)
  R06Res: Res;

  @Field(() => ID)
  R06Ev_por: string;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;

  @Field(() => Usuario, { nullable: true })
  evaluador?: Usuario;
}
