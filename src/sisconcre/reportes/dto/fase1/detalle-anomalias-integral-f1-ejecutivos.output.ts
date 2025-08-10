import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import { AnomaliasResumenTotales, GrupoResumenGlobal } from "./detalle-anomalias-integral-f1.output";

@ObjectType()
export class AnomaliasEjecutivoResumen {
  @Field()
  usuario: string;

  @Field()
  nombre: string;

  @Field()
  sucursal: string; // ← NUEVO CAMPO

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Float)
  promedioErroresPorSolicitud: number;

  @Field(() => [GrupoResumenGlobal])
  grupos: GrupoResumenGlobal[];
}

@ObjectType()
export class DetalleAnomaliasIntegralEjecutivosResponseF1 {
  @Field(() => [AnomaliasEjecutivoResumen])
  ejecutivos: AnomaliasEjecutivoResumen[];

  @Field(() => AnomaliasResumenTotales)
  totales: AnomaliasResumenTotales;
}
