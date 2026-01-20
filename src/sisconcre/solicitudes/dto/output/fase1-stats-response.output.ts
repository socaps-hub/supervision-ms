import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class Fase1ResumenOutput {
  @Field(() => Int) deficiente: number;
  @Field(() => Int) aceptable: number;
  @Field(() => Int) correcto: number;
}

@ObjectType()
export class Fase1ResolucionesOutput {
  @Field(() => Int) pasaComite: number;
  @Field(() => Int) devuelta: number;
}

@ObjectType()
export class Fase1PorcentajeOutput {
  @Field(() => String) deficiente: string;
  @Field(() => String) aceptable: string;
  @Field(() => String) correcto: string;
  @Field(() => String) pasaComite: string;
  @Field(() => String) devuelta: string;
}

@ObjectType()
export class Fase1StatisticsOutput {
  @Field(() => Int)
  totalSolicitudes: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Fase1ResumenOutput)
  resumen: Fase1ResumenOutput;

  @Field(() => Fase1ResolucionesOutput)
  resoluciones: Fase1ResolucionesOutput;

  @Field(() => Fase1PorcentajeOutput)
  porcentaje: Fase1PorcentajeOutput;
}