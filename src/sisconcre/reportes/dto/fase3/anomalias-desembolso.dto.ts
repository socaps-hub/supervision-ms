import { Field, Int, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ElementoDetalleDto {
  @Field(() => String)
  elemento: string;

  @Field(() => String)
  impacto: string;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class RubroDetalleDto {
  @Field(() => String)
  rubro: string;

  @Field(() => Int)
  total: number;

  @Field(() => Float)
  porcentaje: number;

  @Field(() => [ElementoDetalleDto])
  elementos: ElementoDetalleDto[];
}

@ObjectType()
export class EjecutivoDetalleDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  nombre: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalIncorrectos: number;

  @Field(() => [RubroDetalleDto])
  rubros: RubroDetalleDto[];
}

@ObjectType()
export class SucursalDetalleDto {
  @Field(() => String)
  id: string;

  @Field()
  nombre: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalIncorrectos: number;

  @Field(() => [RubroDetalleDto])
  rubros: RubroDetalleDto[];

  @Field(() => [EjecutivoDetalleDto])
  ejecutivos: EjecutivoDetalleDto[];
}

@ObjectType()
export class DetalleAnomaliasF3Response {
  @Field(() => Int)
  totalSolicitudesGlobal: number;

  @Field(() => Int)
  totalIncorrectosGlobal: number;

  @Field(() => [SucursalDetalleDto])
  sucursales: SucursalDetalleDto[];
}
