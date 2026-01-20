import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class Fase4ResumenCalOutput {
  @Field(() => Int)
  deficiente: number;

  @Field(() => Int)
  aceptable: number;

  @Field(() => Int)
  correcto: number;
}

@ObjectType()
export class Fase4StatisticsOutput {
  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Fase4ResumenCalOutput)
  resumen: Fase4ResumenCalOutput;
}
