import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class HistoricoSucursalDto {
  @Field(() => String)
  sucursal: string;

  @Field(() => Int)
  totalSolicitudes: number;

  // Fase 1
  @Field(() => Int, { nullable: true })
  totalAnomalias?: number;

  @Field(() => Float, { nullable: true })
  promedioAnomalias?: number;

  // Fase 2
  @Field(() => Int, { nullable: true })
  totalAnomaliasF1?: number;

  @Field(() => Int, { nullable: true })
  totalSolventados?: number;

  // Fase 3
  @Field(() => Int, { nullable: true })
  totalAnomaliasF3?: number;

  @Field(() => Int, { nullable: true })
  totalPendientes?: number;

  // Fase 4 - Levantamientos
  @Field(() => Int, { nullable: true })
  totalNoSolventadosF1?: number;

  // Fase 4 - Desembolsos
  @Field(() => Int, { nullable: true })
  totalNoSolventadosF3?: number;

  @Field(() => Int, { nullable: true })
  totalPendientesCubiertos?: number;

  @Field(() => Int, { nullable: true })
  totalPendientesPorCubrir?: number;
}

@ObjectType()
export class HistoricoMesDto {
  @Field(() => String)
  mes: string;

  @Field(() => [HistoricoSucursalDto])
  sucursales: HistoricoSucursalDto[];
}

@ObjectType()
export class HistoricoTotalesGlobalesDto {
  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int, { nullable: true })
  totalAnomalias?: number;

  @Field(() => Float, { nullable: true })
  promedioAnomalias?: number;

  @Field(() => Int, { nullable: true })
  totalAnomaliasF1?: number;

  @Field(() => Int, { nullable: true })
  totalSolventados?: number;

  @Field(() => Int, { nullable: true })
  totalAnomaliasF3?: number;

  @Field(() => Int, { nullable: true })
  totalPendientes?: number;

  @Field(() => Int, { nullable: true })
  totalNoSolventadosF1?: number;

  @Field(() => Int, { nullable: true })
  totalNoSolventadosF3?: number;

  @Field(() => Int, { nullable: true })
  totalPendientesCubiertos?: number;

  @Field(() => Int, { nullable: true })
  totalPendientesPorCubrir?: number;
}

@ObjectType()
export class HistoricoResponseDto {
  @Field(() => [HistoricoMesDto])
  meses: HistoricoMesDto[];

  @Field(() => HistoricoTotalesGlobalesDto)
  totales: HistoricoTotalesGlobalesDto;
}
