import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Calificativo as Cal } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { Prestamo } from 'src/sisconcre/solicitudes/entities/solicitud.entity';
import { Calificativo } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@ObjectType()
export class EvaluacionResumenFase4 {
  @Field(() => ID)
  R16P_num: string;

  @Field(() => Int)
  R16SolvT: number;
  
  @Field(() => Int)
  R16SolvA: number;
  
  @Field(() => Int)
  R16SolvM: number;
  
  @Field(() => Int)
  R16SolvB: number;

  @Field(() => Calificativo)
  R16SegCal: Cal;

  @Field(() => Int)
  R16HaSolv: number;

  @Field(() => Int)
  R16PenCu: number;

  @Field(() => Int)
  R16RcF: number;

  @Field(() => Calificativo)
  R16DesCal: Cal;

  @Field(() => Calificativo)
  R16CalF: Cal;

  @Field(() => String)
  R16Obs: string;

  @Field(() => String)
  R16FGlo: string;

  @Field(() => String)
  R16Ev_por: string;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;

  @Field(() => Usuario, { nullable: true })
  evaluador?: Usuario;
}
