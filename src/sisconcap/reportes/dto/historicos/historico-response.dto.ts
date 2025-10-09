import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class SisconcapHistoricoSucursalDto {
  @Field(() => String)
  sucursal: string;

  @Field(() => Int)
  totalMovimientos: number;

  @Field(() => Int)
  totalAnomalias: number;

  @Field(() => Int)
  totalPromedio: number;
}

@ObjectType()
export class SisconcapHistoricoMesDto {
  @Field(() => String)
  mes: string;

  @Field(() => [SisconcapHistoricoSucursalDto])
  sucursales: SisconcapHistoricoSucursalDto[];
}

@ObjectType()
export class SisconcapHistoricoTotalesGlobalesDto {
  @Field(() => Int)
  totalMovimientos: number;

  @Field(() => Int)
  totalAnomalias: number;

  @Field(() => Int)
  totalPromedio: number;
}

@ObjectType()
export class SisconcapHistoricoResponseDto {
  @Field(() => [SisconcapHistoricoMesDto])
  meses: SisconcapHistoricoMesDto[];

  @Field(() => SisconcapHistoricoTotalesGlobalesDto)
  totales: SisconcapHistoricoTotalesGlobalesDto;
}
