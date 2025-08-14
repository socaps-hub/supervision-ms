// 📌 dto/reporte-fase4.dto.ts
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReporteFase4EjecutivoDto {
  @Field()
  id: string;

  @Field()
  nombre: string;

  @Field()
  usuario: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  correctas: number;

  @Field(() => Float)
  correctasPct: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Float)
  deficientesPct: number;

  @Field(() => Int)
  pendientes: number;

  @Field(() => Float)
  pendientesPct: number;

  @Field(() => Int)
  anomalias: number;

  @Field(() => Int)
  solventadas: number;

  @Field(() => Float)
  solventadasPct: number;

  @Field(() => Int)
  noSolventadas: number;

  @Field(() => Float)
  noSolventadasPct: number;

  @Field(() => Int)
  anomaliasDesembolso: number;

  @Field(() => Int)
  solventadasDesembolso: number;

  @Field(() => Int)
  noSolventadasDesembolso: number;

  @Field(() => Int)
  solventadasDesembolsoPct: number;

  @Field(() => Float)
  noSolventadasDesembolsoPct: number;

  @Field(() => Int)
  pendientesF3: number;

  @Field(() => Int)
  pendientesSolventados: number;

  @Field(() => Int)
  pendientesPorCubrir: number;

  @Field(() => Int)
  anomaliasTotalesPorSolventar: number;

  @Field(() => Int)
  anomaliasTotalesPorSolventarPct: number;
}

@ObjectType()
export class ReporteFase4SucursalDto {
  @Field()
  id: string;  

  @Field()
  nombre: string;

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  correctas: number;

  @Field(() => Float)
  correctasPct: number;

  @Field(() => Int)
  deficientes: number;

  @Field(() => Float)
  deficientesPct: number;

  @Field(() => Int)
  pendientes: number;

  @Field(() => Float)
  pendientesPct: number;

  @Field(() => Int)
  anomalias: number;

  @Field(() => Int)
  solventadas: number;

  @Field(() => Float)
  solventadasPct: number;

  @Field(() => Int)
  noSolventadas: number;

  @Field(() => Float)
  noSolventadasPct: number;

  @Field(() => Int)
  anomaliasDesembolso: number;

  @Field(() => Int)
  solventadasDesembolso: number;

  @Field(() => Int)
  solventadasDesembolsoPct: number;

  @Field(() => Int)
  noSolventadasDesembolso: number;

  @Field(() => Float)
  noSolventadasDesembolsoPct: number;

  @Field(() => Int)
  pendientesF3: number;

  @Field(() => Int)
  pendientesSolventados: number;

  @Field(() => Int)
  pendientesPorCubrir: number;

  @Field(() => Int)
  anomaliasTotalesPorSolventar: number;

  @Field(() => Int)
  anomaliasTotalesPorSolventarPct: number;

  @Field(() => [ReporteFase4EjecutivoDto])
  ejecutivos: ReporteFase4EjecutivoDto[];
}

@ObjectType()
export class ReporteFase4Response {
  @Field(() => [ReporteFase4SucursalDto])
  sucursales: ReporteFase4SucursalDto[];

  @Field(() => Int)
  totalSolicitudesGlobal: number;

  @Field(() => Int)
  totalCorrectasGlobal: number;

  @Field(() => Float)
  pctCorrectasGlobal: number;

  @Field(() => Int)
  totalDeficientesGlobal: number;

  @Field(() => Float)
  pctDeficientesGlobal: number;

  @Field(() => Int)
  totalPendientesGlobal: number;

  @Field(() => Float)
  pctPendientesGlobal: number;

  @Field(() => Int)
  totalAnomaliasGlobal: number;

  @Field(() => Int)
  totalSolventadasGlobal: number;

  @Field(() => Float)
  pctSolventadasGlobal: number;

  @Field(() => Int)
  totalNoSolventadasGlobal: number;

  @Field(() => Float)
  pctNoSolventadasGlobal: number;

  @Field(() => Int)
  totalAnomaliasDesembolsoGlobal: number;

  @Field(() => Int)
  totalSolventadasDesembolsoGlobal: number;

  @Field(() => Int)
  pctSolventadasDesembolsoGlobal: number;

  @Field(() => Int)
  totalNoSolventadasDesembolsoGlobal: number;

  @Field(() => Float)
  pctNoSolventadasDesembolsoGlobal: number;

  @Field(() => Int)
  totalPendientesF3Global: number;

  @Field(() => Int)
  totalPendientesSolventadosGlobal: number;

  @Field(() => Int)
  totalPendientesPorCubrirGlobal: number;

  @Field(() => Int)
  totalAnomaliasTotalesPorSolventarGlobal: number;

  @Field(() => Int)
  pctTotalAnomaliasTotalesPorSolventarGlobal: number;
}
