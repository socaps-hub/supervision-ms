import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { AResultado } from '@prisma/client';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AccionResultadoEnum } from '../../enums/accion-resultado.enum';

@ObjectType()
export class EvaluacionResumenF2ACredito {
  @Field(() => Int)
  A06Id: number;

  @Field(() => Int)
  A06Solv: number;

  @Field(() => Int)
  A06NSolv: number;

  @Field(() => AccionResultadoEnum)
  A06ARes: AResultado;

  @Field(() => String)
  A06Obs: string;

  @Field(() => ID)
  A06Aud_id: string;

  @Field(() => String)
  A06FSeg: string;

  // ───────────────────────────────
  // Relaciones
  // ───────────────────────────────
  @Field(() => MuestraCreditoSeleccion, { nullable: true })
  creditoSeleccion?: MuestraCreditoSeleccion;

  @Field(() => Usuario, { nullable: true })
  auditor?: Usuario;
}
