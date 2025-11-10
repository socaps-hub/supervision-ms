import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class MuestraCreditoSeleccionOutput {
  @Field(() => Int)
  A02Id: number;

  @Field(() => Int)
  A02MuestraId: number;

  @Field(() => Int)
  A02CreditoFolio: number;

  // ───────────────────────────────
  // Información desnormalizada del crédito
  // ───────────────────────────────
  @Field(() => String, { nullable: true })
  A02CAG?: string;

  @Field(() => String, { nullable: true })
  A02Nombre?: string;

  @Field(() => String, { nullable: true })
  A02Relacion?: string;

  @Field(() => String, { nullable: true })
  A02Prestamo?: string;

  @Field(() => String, { nullable: true })
  A02Sucursal?: string;

  @Field(() => String, { nullable: true })
  A02Clasificacion?: string;

  @Field(() => String, { nullable: true })
  A02Producto?: string;

  @Field(() => String, { nullable: true })
  A02Finalidad?: string;

  @Field(() => String, { nullable: true })
  A02DestinoAgro?: string;

  @Field(() => String, { nullable: true })
  A02TipoPago?: string;

  @Field(() => String, { nullable: true })
  A02FechaOtorgamiento?: string;

  @Field(() => String, { nullable: true })
  A02FechaVencimiento?: string;

  @Field(() => String, { nullable: true })
  A02FechaConsultaBuro?: string;

  @Field(() => String, { nullable: true })
  A02FechaEntrega?: string;

  @Field(() => Int, { nullable: true })
  A02PlazoDias?: number;

  @Field(() => Float, { nullable: true })
  A02TasaInteresNormal?: number;

  @Field(() => Int, { nullable: true })
  A02CantidadEntregada?: number;

  @Field(() => Float, { nullable: true })
  A02DeudaTotal?: number;

  @Field(() => Float, { nullable: true })
  A02GarantiaLiquida?: number;

  @Field(() => Float, { nullable: true })
  A02GarantiaPrendaria?: number;

  @Field(() => Float, { nullable: true })
  A02GarantiaHipotecaria?: number;

  @Field(() => String, { nullable: true })
  A02TipoAutorizacion?: string;

  @Field(() => String, { nullable: true })
  A02UsrAutorizacionNi?: string;

  @Field(() => String, { nullable: true })
  A02UsrAutorizacionNombre?: string;

  @Field(() => String, { nullable: true })
  A02EjecutivoNombre?: string;

  // 🔹 Campo calculado
  @Field(() => String, { nullable: true })
  A02TipoCredito?: string;
}
