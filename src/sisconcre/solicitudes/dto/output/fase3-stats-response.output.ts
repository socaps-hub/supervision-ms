import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Fase3ResumenStatsOutput {

  @Field(() => Int)
  deficiente: number;

  @Field(() => Int)
  pendientes: number;

  @Field(() => Int)
  correcto: number;

}

@ObjectType()
export class Fase3StatisticsOutput {

  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Int)
  totalCorrectos: number;

  @Field(() => Int)
  totalPendientes: number;

  @Field(() => Fase3ResumenStatsOutput)
  resumen: Fase3ResumenStatsOutput;

}
