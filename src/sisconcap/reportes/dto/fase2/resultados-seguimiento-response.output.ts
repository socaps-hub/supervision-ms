import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReporteSucursalF2Response {
  @Field(() => String)
  sucursal: string;

  @Field(() => Int)
  conteo: number;

  @Field(() => Int)
  correctos: number;

  @Field(() => Int)
  pctCorrectos: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Int)
  pctDeficientes: number;

  @Field(() => Int)
  anomaliasPrevias: number;

  @Field(() => Int)
  solventadas: number;

  @Field(() => Int)
  pctSolventadas: number;

  @Field(() => Int)
  noSolventadas: number;

  @Field(() => Int)
  pctNoSolventadas: number;
}

@ObjectType()
export class ReporteCategoriaF2Response {
  @Field(() => [ReporteSucursalF2Response])
  sucursales: ReporteSucursalF2Response[];

  @Field(() => Int)
  conteo: number;

  @Field(() => Int)
  correctos: number;

  @Field(() => Int)
  pctCorrectos: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Int)
  pctDeficientes: number;

  @Field(() => Int)
  anomaliasPrevias: number;

  @Field(() => Int)
  solventadas: number;

  @Field(() => Int)
  pctSolventadas: number;

  @Field(() => Int)
  noSolventadas: number;

  @Field(() => Int)
  pctNoSolventadas: number;
}

@ObjectType()
export class ResultadosSeguimientoResponse {
    @Field(() => ReporteCategoriaF2Response)
    ingresos: ReporteCategoriaF2Response;

    @Field(() => ReporteCategoriaF2Response)
    aperturas: ReporteCategoriaF2Response;

    @Field(() => ReporteCategoriaF2Response)
    actualizaciones: ReporteCategoriaF2Response;

    @Field(() => ReporteCategoriaF2Response)
    bajas: ReporteCategoriaF2Response;
}
