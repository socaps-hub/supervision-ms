import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

/**
 * 🔹 Output para listar todas las muestras (inventario)
 * Incluye información agregada + fechas en formato string (ISO)
 */
@ObjectType()
export class MuestraSeleccionCreditoResumen {
  @Field(() => Int)
  A01Id: number;

  @Field(() => String)
  A01UsuarioId: string;

  @Field(() => String)
  A01CoopId: string;

  @Field(() => Float)
  A01MargenError: number;

  @Field(() => Float)
  A01NivelConfianza: number;

  @Field(() => Int)
  A01TamanoMuestra: number;

  @Field(() => Int)
  A01TamanoUniverso: number;

  @Field(() => Boolean)
  A01Finalizada: boolean;

  /** 🔸 Fechas en formato ISO (string), no Date */
  @Field(() => String, { nullable: true })
  A01FechaInicio?: string | null;

  @Field(() => String, { nullable: true })
  A01FechaFinal?: string | null;

  @Field(() => String, { nullable: true })
  A01FechaCreacion?: string | null;

  /** 🔹 Campos agregados */
  @Field(() => String)
  trimestre: string;

  @Field(() => Int)
  totalCreditosSeleccionados: number;
}

/**
 * 🔹 Respuesta paginada / global del servicio
 */
@ObjectType()
export class ResultadoMuestrasResponse {
  @Field(() => [MuestraSeleccionCreditoResumen])
  muestras: MuestraSeleccionCreditoResumen[];

  @Field(() => Int)
  totalRegistros: number;

  @Field(() => Int)
  totalPaginas: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}
