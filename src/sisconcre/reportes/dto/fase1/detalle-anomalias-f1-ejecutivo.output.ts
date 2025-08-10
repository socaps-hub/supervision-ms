// anomaly-detalle-ejecutivo.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ElementoDetalle {
  @Field()
  elemento: string;

  @Field(() => Int)
  total: number;

  @Field()
  impacto: string; // A, M, B, etc.
}

@ObjectType()
export class RubroDetalle {
  @Field()
  rubro: string;

  @Field(() => [ElementoDetalle])
  elementos: ElementoDetalle[];
}

@ObjectType()
export class EjecutivoDetalle {
  @Field()
  usuario: string;

  @Field()
  nombre: string;

  @Field()
  sucursal: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => [RubroDetalle])
  rubros: RubroDetalle[];

  @Field(() => Int)
  totalErrores: number;
}

@ObjectType()
export class TotalesColumnasDetalle {
  @Field(() => [RubroDetalle])
  rubros: RubroDetalle[];

  @Field(() => Int)
  totalErroresGlobales: number;
}

@ObjectType()
export class DetalleAnomaliasEjecutivoF1Response {
  @Field(() => [EjecutivoDetalle])
  ejecutivos: EjecutivoDetalle[];

  @Field(() => TotalesColumnasDetalle)
  totales: TotalesColumnasDetalle;
}
