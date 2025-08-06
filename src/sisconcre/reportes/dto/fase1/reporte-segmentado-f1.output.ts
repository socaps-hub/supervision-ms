import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ReporteSegmentadoSucursal {
  @Field() sucursal: string;

  @Field(() => Int) total: number;

  @Field(() => Int) devueltas: number;
  @Field(() => Float) porcentajeDevueltas: number;

  @Field(() => Int) anomaliasDevueltas: number;

  @Field(() => Int) comite: number;
  @Field(() => Float) porcentajeComite: number;

  @Field(() => Int) correctas: number;
  @Field(() => Float) porcentajeCorrectas: number;

  @Field(() => Int) aceptables: number;
  @Field(() => Float) porcentajeAceptables: number;

  @Field(() => Int) deficientes: number;
  @Field(() => Float) porcentajeDeficientes: number;

  @Field(() => Int) anomaliasComite: number;
  @Field(() => Int) totalAnomalias: number;
}

@ObjectType()
export class ReporteSegmentadoFase1Response {
  @Field(() => [ReporteSegmentadoSucursal])
  sucursales: ReporteSegmentadoSucursal[];

  @Field(() => Int) totalSolicitudes: number;
  @Field(() => Int) totalDevueltas: number;
  @Field(() => Int) porcentajeDevueltas: number;

  @Field(() => Int) totalComite: number;
  @Field(() => Int) porcentajeComite: number;

  @Field(() => Int) totalAnomaliasDevueltas: number;
  @Field(() => Int) totalAnomaliasComite: number;
  @Field(() => Int) totalAnomalias: number;

  @Field(() => Int) totalCorrectas: number;
  @Field(() => Int) porcentajeCorrectas: number;

  @Field(() => Int) totalAceptables: number;
  @Field(() => Int) porcentajeAceptables: number;

  @Field(() => Int) totalDeficientes: number;
  @Field(() => Int) porcentajeDeficientes: number;
}

