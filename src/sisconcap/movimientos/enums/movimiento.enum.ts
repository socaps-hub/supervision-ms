import { registerEnumType } from "@nestjs/graphql";

export enum MovimientoEnum {
  ACTUALIZACION = 'ACTUALIZACION',
  ALTA = 'ALTA',
  APERTURA = 'APERTURA',
  BAJA = 'BAJA',
}

registerEnumType(MovimientoEnum, { name: 'MovimientoEnum' });
