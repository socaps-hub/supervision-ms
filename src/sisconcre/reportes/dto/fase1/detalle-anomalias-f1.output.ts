import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DetalleElemento {
  @Field()
  elemento: string;

  @Field(() => Int)
  total: number;

  @Field()
  impacto: string; // ← Nuevo campo: puede ser 'A', 'M', 'B', etc.
}

@ObjectType()
export class DetalleRubroPorSucursal {
  @Field()
  rubro: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  porcentaje: number;

  @Field(() => [DetalleElemento])
  elementos: DetalleElemento[];
}

@ObjectType()
export class ElementosIncorrectosPorSucursal {
  @Field()
  nombre: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalIncorrectos: number;

  @Field(() => [ElementoIncorrecto])
  elementosIncorrectos: ElementoIncorrecto[];

  @Field(() => [DetalleRubroPorSucursal])
  rubros: DetalleRubroPorSucursal[];
}

@ObjectType()
export class ElementoIncorrecto {
  @Field()
  elemento: string;

  @Field(() => Int)
  cantidad: number;
}

@ObjectType()
export class DetalleAnomaliasF1Response {
  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalIncorrectosGlobal: number;

  @Field(() => [ElementosIncorrectosPorSucursal])
  sucursales: ElementosIncorrectosPorSucursal[];
}

