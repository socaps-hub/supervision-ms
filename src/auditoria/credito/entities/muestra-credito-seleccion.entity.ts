import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/library';
import { MuestraSeleccionCredito } from './muestra-seleccion-credito.entity';
import { RA01Credito } from './radiografia-credito.entity';
import { Sucursal } from 'src/common/entities/sucursal.entity';
import { EvaluacionF1ACredito } from 'src/auditoria/fase1-revision/entities/credito/evaluacion-f1-a-credito.entity.ts';
import { EvaluacionResumenF1ACredito } from 'src/auditoria/fase1-revision/entities/credito/evaluacion-resumen-f1-a-credito.entity';

@ObjectType()
export class MuestraCreditoSeleccion {

  @Field(() => Int)
  A02Id: number;

  @Field(() => Int)
  A02MuestraId: number;

  @Field(() => MuestraSeleccionCredito, { nullable: true })
  muestra?: MuestraSeleccionCredito;

  // Crédito original (FK)
  @Field(() => Int)
  A02CreditoFolio: number;

  @Field(() => RA01Credito, { nullable: true })
  credito?: RA01Credito;
  
  @Field(() => String, { nullable: true })
  A02Sucursal?: string;

  @Field(() => Sucursal, { nullable: true })
  sucursal?: Sucursal;

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

  // @Field(() => String, { nullable: true })
  // A02FechaEntrega?: string;

  @Field(() => Int, { nullable: true })
  A02PlazoDias?: number;

  @Field(() => Float, { nullable: true })
  A02TasaInteresNormal?: Decimal;

  @Field(() => Int, { nullable: true })
  A02CantidadEntregada?: number;

  @Field(() => Float, { nullable: true })
  A02DeudaTotal?: Decimal;

  @Field(() => Float, { nullable: true })
  A02GarantiaLiquida?: Decimal;

  @Field(() => Float, { nullable: true })
  A02GarantiaPrendaria?: Decimal;

  @Field(() => Float, { nullable: true })
  A02GarantiaHipotecaria?: Decimal;

  @Field(() => String, { nullable: true })
  A02TipoAutorizacion?: string;

  @Field(() => String, { nullable: true })
  A02UsrAutorizacionNi?: string;

  @Field(() => String, { nullable: true })
  A02UsrAutorizacionNombre?: string;

  // 🔹 Campo calculado: “Aut.” o “Ord.”
  @Field(() => String, { nullable: true })
  A02TipoCredito?: string;

  @Field(() => String)
  A02Estado: string

  // Relaciones
  @Field(() => [EvaluacionF1ACredito], { nullable: true })
  evaluacionRevisionF1?: EvaluacionF1ACredito[]

  @Field(() => EvaluacionResumenF1ACredito, { nullable: true })
  resumenRevisionF1?: EvaluacionResumenF1ACredito
}
