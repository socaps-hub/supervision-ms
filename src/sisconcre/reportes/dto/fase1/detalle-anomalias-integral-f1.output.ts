import { ObjectType, Field, Int, Float } from "@nestjs/graphql";

@ObjectType()
export class GrupoResumenGlobal {
  @Field()
  grupo: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  porcentaje: number;
}

@ObjectType()
export class AnomaliasResumenTotales {
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
export class AnomaliasResumenResponseF1 {
  @Field(() => [SucursalResumen])
  sucursales: SucursalResumen[];

  @Field(() => AnomaliasResumenTotales)
  totales: AnomaliasResumenTotales;
}

@ObjectType()
export class SucursalResumen {
  @Field()
  sucursal: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Float)
  promedioErroresPorSolicitud: number;

  @Field(() => [GrupoResumenGlobal])
  grupos: GrupoResumenGlobal[];
}