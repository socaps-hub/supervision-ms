import { ArgsType, Field } from '@nestjs/graphql';
import { Movimiento } from '@prisma/client';
import { MovimientoEnum } from 'src/sisconcap/movimientos/enums/movimiento.enum';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';

@ArgsType()
export class ResumenAnomaliasArgs {
  @Field(() => MovimientoEnum, { nullable: false })
  categoria: Movimiento;

  @Field(() => String, { nullable: false })
  sucursal: string;

  @Field(() => FiltroFechasInput, { nullable: false })
  filtro: FiltroFechasInput;
}
