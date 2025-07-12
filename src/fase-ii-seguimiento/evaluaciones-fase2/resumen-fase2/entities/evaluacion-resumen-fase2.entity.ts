import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { Calificativo, Resolucion } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';
import { Prestamo } from 'src/fase-i-levantamiento/solicitudes/entities/solicitud.entity';

@ObjectType()
export class EvaluacionResumenFase2 {
  @Field(() => ID)
  R08P_num: string;

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

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;
}
