import { Field, Int, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class ReporteFase2Sucursal {
  @Field()
  sucursal: string;

  @Field(() => Int)
  solicitudesNum: number;

  @Field(() => Int)
  correctas: number;

  @Field(() => Float)
  correctasPct: number;

  @Field(() => Int)
  aceptables: number;

  @Field(() => Float)
  aceptablesPct: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Float)
  deficientesPct: number;

  @Field(() => Int)
  solventadas: number;

  @Field(() => Float)
  solventadasPct: number;

  @Field(() => Int)
  noSolventadas: number;

  @Field(() => Float)
  noSolventadasPct: number;

  @Field(() => Int)
  hallazgosNum: number;

  @Field(() => Int)
  hallazgosSolventadas: number;

  @Field(() => Float)
  hallazgosSolventadasPct: number;

  @Field(() => Int)
  hallazgosNoSolventadas: number;

  @Field(() => Float)
  hallazgosNoSolventadasPct: number;
}

@ObjectType()
export class ReporteFase2Response {
  @Field(() => [ReporteFase2Sucursal])
  sucursales: ReporteFase2Sucursal[];

  @Field(() => Int)
  totalSolicitudesNum: number;

  @Field(() => Int)
  totalCorrectas: number;

  @Field(() => Int)
  totalAceptables: number;

  @Field(() => Int)
  totalDeficientes: number;

  @Field(() => Int)
  totalSolventadas: number;

  @Field(() => Int)
  totalNoSolventadas: number;

  @Field(() => Int)
  totalHallazgosNum: number;

  @Field(() => Int)
  totalHallazgosSolventadas: number;

  @Field(() => Int)
  totalHallazgosNoSolventadas: number;

  @Field(() => Float)
  pctCorrectasGlobal: number;

  @Field(() => Float)
  pctDeficientesGlobal: number;

  @Field(() => Float)
  pctAceptablesGlobal: number;

  @Field(() => Float)
  pctSolventadasGlobal: number;

  @Field(() => Float)
  pctNoSolventadasGlobal: number;

  @Field(() => Float)
  pctHallazgosSolventadasGlobal: number;

  @Field(() => Float)
  pctHallazgosNoSolventadasGlobal: number;
}
