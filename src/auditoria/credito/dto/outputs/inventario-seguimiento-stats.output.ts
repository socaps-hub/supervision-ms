// auditoria/dto/outputs/credito/inventario-seguimiento-stats.output.ts
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InventarioSeguimientoStatsOutput {

  @Field(() => Int)
  totalCreditos: number;

  @Field(() => Int)
  totalSolventados: number;

  @Field(() => Int)
  totalNoSolventados: number;

  @Field(() => Int)
  totalAccionResultadoSolventado: number;

  @Field(() => Int)
  totalAccionResultadoNoSolventado: number;
}
