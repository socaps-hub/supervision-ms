import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Movimiento } from '../../entities/movimiento.entity';

@ObjectType()
export class InventarioMovimientosResponse {
  @Field(() => [Movimiento])
  registros: Movimiento[];
  
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalRegistros: number;
}
