import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class SisconcapFase1ResumenCalOutput {
  @Field(() => Int)
  deficiente: number;

  @Field(() => Int)
  correcto: number;
}

@ObjectType()
export class SisconcapFase1StatisticsOutput {
  @Field(() => Int)
  totalMovimientos: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => SisconcapFase1ResumenCalOutput)
  resumen: SisconcapFase1ResumenCalOutput;
}
