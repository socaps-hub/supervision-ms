import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo, Resolucion } from '../enums/evaluacion.enum';
import { Prestamo } from 'src/fase-i-levantamiento/solicitudes/entities/solicitud.entity';

@ObjectType()
export class EvaluacionResumenFase1 {
  @Field(() => ID)
  R06P_num: string;

  @Field(() => Int)
  R06Ha: number;

  @Field(() => Int)
  R06Hm: number;

  @Field(() => Int)
  R06Hb: number;

  @Field(() => Int)
  R06Rc: number;

  @Field(() => Calificativo)
  R06Cal: Calificativo;

  @Field(() => Resolucion)
  R06Res: Resolucion;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;
}
