import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Calificativo as Cal, CalificativoB } from '@prisma/client';

import { CalificativoBEnum } from '../../enums/calificativo-b.enum';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';
import { Usuario } from 'src/common/entities/usuario.entity';
import { Calificativo } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@ObjectType()
export class EvaluacionResumenF1ACredito {
  @Field(() => Int)
  A04Id: number;

  @Field(() => String)
  A04PSAut: string;

  @Field(() => String)
  A04Excep: string;

  @Field(() => Int)
  A04Ha: number;

  @Field(() => Int)
  A04PRes: number;
  
  @Field(() => Int)
  A04MonR: number;

  @Field(() => Calificativo)
  A04CalA: Cal;

  @Field(() => CalificativoBEnum)
  A04CalB: CalificativoB;

  @Field(() => String)
  A04Obs: string;

  @Field(() => String)
  A04Comp: string;

  @Field(() => String)
  A04FPlzo: string;

  @Field(() => ID)
  A04Resp: string;

  @Field(() => ID)
  A04Aud_id: string;

  @Field(() => String)
  A04FRev: string;

  // ───────────────────────────────
  // Relaciones
  // ───────────────────────────────
  @Field(() => MuestraCreditoSeleccion, { nullable: true })
  creditoSeleccion?: MuestraCreditoSeleccion;

  @Field(() => Usuario, { nullable: true })
  auditor?: Usuario;

  @Field(() => Usuario, { nullable: true })
  responsable?: Usuario;
}
