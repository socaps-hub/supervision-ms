import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class Fase2ResumenOutput {
  @Field(() => Int) deficiente: number;
  @Field(() => Int) correcto: number;
}

@ObjectType()
export class Fase2StatisticsOutput {
  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Int)
  totalCorrectos: number;

  @Field(() => Int)
  totalSolventados: number;

  @Field(() => Fase2ResumenOutput)
  resumen: Fase2ResumenOutput;
}