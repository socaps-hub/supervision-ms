import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MuestraCreditoSeleccion } from '../../entities/muestra-credito-seleccion.entity';

@ObjectType()
export class InventarioRevisionResponse {
  @Field(() => [MuestraCreditoSeleccion])
  registros: MuestraCreditoSeleccion[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalRegistros: number;
}
