import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ReporteSeguimientoAnomaliasRowDTO {

  @Field(() => String)
  sucursal: string;

  // ───────── Seguimiento Expedientes ─────────
  @Field(() => Int)
  expedientesSeguimiento: number;

  @Field(() => Int)
  solventadosExp: number;

  @Field(() => Int)
  noSolventadosExp: number;

  @Field(() => Float)
  cumplimiento: number;

  @Field(() => Float)
  incumplimiento: number;

  // ───────── Seguimiento Hallazgos ─────────
  @Field(() => Int)
  hallazgos: number;

  @Field(() => Int)
  solventadosHall: number;

  @Field(() => Int)
  noSolventadosHall: number;

  @Field(() => Float)
  corregidos: number;

  @Field(() => Float)
  sinCorregir: number;
}

@ObjectType()
export class ReporteSeguimientoAnomaliasTotalesDTO {

  @Field(() => Int)
  expedientesSeguimiento: number;

  @Field(() => Int)
  solventadosExp: number;

  @Field(() => Int)
  noSolventadosExp: number;

  @Field(() => Float)
  cumplimiento: number;

  @Field(() => Float)
  incumplimiento: number;

  @Field(() => Int)
  hallazgos: number;

  @Field(() => Int)
  solventadosHall: number;

  @Field(() => Int)
  noSolventadosHall: number;

  @Field(() => Float)
  corregidos: number;

  @Field(() => Float)
  sinCorregir: number;
}

@ObjectType()
export class ReporteSeguimientoAnomaliasResponseDTO {

  @Field(() => [ReporteSeguimientoAnomaliasRowDTO])
  rows: ReporteSeguimientoAnomaliasRowDTO[];

  @Field(() => ReporteSeguimientoAnomaliasTotalesDTO)
  totales: ReporteSeguimientoAnomaliasTotalesDTO;
}
