import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ReporteFase1SucursalRowDTO {

  @Field(() => String)
  sucursal: string;

  @Field(() => Int)
  expedientesRevisados: number;

  @Field(() => Int)
  correctos: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Float)
  cumplimiento: number;

  @Field(() => Float)
  incumplimiento: number;

  @Field(() => Int)
  aceptables: number;

  @Field(() => Int)
  graves: number;
}

@ObjectType()
export class ReporteFase1TotalesDTO {

  @Field(() => Int)
  expedientesRevisados: number;

  @Field(() => Int)
  correctos: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Float)
  cumplimiento: number;

  @Field(() => Float)
  incumplimiento: number;

  @Field(() => Int)
  aceptables: number;

  @Field(() => Int)
  graves: number;
}

@ObjectType()
export class ReporteFase1ResponseDTO {

  @Field(() => [ReporteFase1SucursalRowDTO])
  rows: ReporteFase1SucursalRowDTO[];

  @Field(() => ReporteFase1TotalesDTO)
  totales: ReporteFase1TotalesDTO;
}
