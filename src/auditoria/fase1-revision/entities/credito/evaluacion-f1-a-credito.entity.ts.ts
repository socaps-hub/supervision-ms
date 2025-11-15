import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ResFaseI } from '@prisma/client';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';

@ObjectType()
export class EvaluacionF1ACredito {
  @Field(() => ID)
  A03Id: string;

  @Field(() => Int)
  A03CSId: number;

  @Field(() => String)
  A03E_id: string;

  @Field(() => ResFaseI)
  A03Res: ResFaseI;

  // ───────────────────────────────
  // Relaciones
  // ───────────────────────────────
  @Field(() => MuestraCreditoSeleccion, { nullable: true })
  creditoSeleccion?: MuestraCreditoSeleccion;
}
