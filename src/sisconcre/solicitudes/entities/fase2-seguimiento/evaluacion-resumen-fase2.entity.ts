import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { Usuario } from 'src/common/entities/usuario.entity';
import { Prestamo } from 'src/sisconcre/solicitudes/entities/solicitud.entity';
import { Calificativo, Resolucion } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@ObjectType()
export class EvaluacionResumenFase2 {
  @Field(() => ID)
  R08Id: string;

  @Field(() => ID)
  R08P_id: string;

  @Field(() => Int)
  R08SolvT: number;

  @Field(() => Int)
  R08SolvA: number;

  @Field(() => Int)
  R08SolvM: number;

  @Field(() => Int)
  R08SolvB: number;

  @Field(() => Int)
  R08Rc: number;

  @Field(() => Calificativo)
  R08Cal: Cal;

  @Field(() => Resolucion)
  R08Res: Res;

  @Field(() => String)
  R08Obs: string;

  @Field(() => String)
  R08FSeg: string;

  @Field(() => ID)
  R08Ev_por: string;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;

  @Field(() => Usuario, { nullable: true })
  evaluador?: Usuario;
}
