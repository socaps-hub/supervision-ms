import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ResFaseII } from '@prisma/client';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';

@ObjectType()
export class EvaluacionF2ACredito {
  @Field(() => ID)
  A05Id: string;

  @Field(() => Int)
  A05CSId: number;

  @Field(() => String)
  A05E_id: string;

  @Field(() => ResFaseII)
  A05Res: ResFaseII;

  // ───────────────────────────────
  // Relaciones
  // ───────────────────────────────
  @Field(() => MuestraCreditoSeleccion, { nullable: true })
  creditoSeleccion?: MuestraCreditoSeleccion;
}
