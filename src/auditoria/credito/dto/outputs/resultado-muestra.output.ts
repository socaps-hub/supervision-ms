import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class RegistroMuestraCredito {
  @Field(() => Int)
  RA01Folio: number;

  @Field(() => String)
  RA01NumeroDeCredito: string;

  @Field(() => String, { nullable: true })
  RA01NumeroCag?: string;

  @Field(() => String)
  RA01Nombre: string;

  @Field(() => String)
  RA01Sucursal: string;

  @Field(() => String)
  RA01FEntrega: string;

  @Field(() => String, { nullable: true })
  RA01Tipo?: string;

  @Field(() => String, { nullable: true })
  RA01Categoria?: string;

  @Field(() => Int, { nullable: true })
  RA01CEntregada?: number;

  @Field(() => String, { nullable: true })
  RA01TipoDeAutorizacion?: string;

  @Field(() => String, { nullable: true })
  RA01SocioRelacionado?: string;

  @Field(() => String, { nullable: true })
  RA01Riesgo?: string;

  @Field(() => Int, { nullable: true })
  RA01DiasMora?: number;
}

@ObjectType()
export class ResultadoMuestraCategoriaResumen {
  @Field(() => String)
  categoria: string;

  @Field(() => Int)
  cantidad: number;

  @Field(() => Float)
  porcentajeUniverso: number;

  @Field(() => Int)
  numeroExpedientes: number;
}

@ObjectType()
export class ResultadoMuestraSucursalResumen {
  @Field(() => String)
  sucursal: string;

  @Field(() => Int)
  creditosOtorgados: number;

  @Field(() => Float)
  porcentajeUniverso: number;

  @Field(() => Int)
  numeroExpedientes: number;

  @Field(() => [ResultadoMuestraCategoriaResumen])
  categorias: ResultadoMuestraCategoriaResumen[];
}

@ObjectType()
export class ResultadoMuestraCreditoResponse {
  @Field(() => Int)
  tamanoUniverso: number;

  @Field(() => Int)
  tamanoMuestra: number;

  @Field(() => [RegistroMuestraCredito])
  registrosMuestra: RegistroMuestraCredito[];

  @Field(() => [ResultadoMuestraSucursalResumen])
  resumenSucursales: ResultadoMuestraSucursalResumen[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int, { nullable: true })
  totalPages: number;
}
