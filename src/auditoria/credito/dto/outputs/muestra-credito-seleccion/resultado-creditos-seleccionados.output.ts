import { Field, ObjectType, Int } from '@nestjs/graphql';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';

@ObjectType()
export class ResultadoCreditosSeleccionadosResponse {
  @Field(() => [MuestraCreditoSeleccion])
  creditos: MuestraCreditoSeleccion[];

  @Field(() => Int)
  totalRegistros: number;

  @Field(() => Int, { nullable: true })
  totalPaginas?: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;
}
