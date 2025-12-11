import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prestamo } from '../../entities/solicitud.entity';

@ObjectType()
export class InventarioSolicitudesResponse {
  @Field(() => [Prestamo])
  registros: Prestamo[];

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalRegistros: number;
}
