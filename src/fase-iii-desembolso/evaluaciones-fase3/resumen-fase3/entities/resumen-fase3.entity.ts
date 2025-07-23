import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal } from '@prisma/client';
import { Prestamo } from 'src/fase-i-levantamiento/solicitudes/entities/solicitud.entity';
import { Calificativo } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';
import { Usuario } from 'src/common/entities/usuario.entity';

@ObjectType()
export class EvaluacionResumenFase3 {

  @Field(() => ID)
  R10P_num: string;

  @Field(() => Int)
  R10Ha: number; // Hallazgos

  @Field(() => Int)
  R10Pendientes: number;

  @Field(() => Int)
  R10Rc: number; // Resultados correctos

  @Field(() => Calificativo)
  R10Cal: Cal;

  @Field(() => String)
  R10Obs: string;
  
  @Field(() => String)
  R10FDes: string;
  
  @Field(() => ID)
  R10Ev_por: string

  @Field(() => ID)
  R10Sup: string

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;

  @Field(() => Usuario, { nullable: true })
  evaluador?: Usuario;

  @Field(() => Usuario, { nullable: true })
  supervisor?: Usuario;
  
}
