import { ObjectType, Field, Int } from "@nestjs/graphql";
import { RubroHallazgoDto } from "./acredito-reporte-detalle-hallazgos-reponse.output";

@ObjectType()
export class CategoriaHallazgoDto {

  @Field(() => String)
  categoria: string; // COMERCIAL, CONSUMO, VIVIENDA

  @Field(() => Int)
  totalCreditos: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => [RubroHallazgoDto])
  rubros: RubroHallazgoDto[];
}

@ObjectType()
export class ReporteHallazgosF1PorCategoriaResponse {

  @Field(() => Int)
  totalCreditosGlobal: number;

  @Field(() => Int)
  totalHallazgosGlobal: number;

  @Field(() => [CategoriaHallazgoDto])
  categorias: CategoriaHallazgoDto[];
}
