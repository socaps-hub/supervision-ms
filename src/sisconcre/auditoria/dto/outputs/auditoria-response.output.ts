import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AuditoriaResponse {
  @Field(() => String)
  prestamo: string; // Número de Crédito (R01NUM)

  @Field(() => String)
  sucursal: string; // Nombre de la sucursal (resuelto desde R11Sucursal)

  @Field(() => String)
  cag: string; // Número CAG

  @Field(() => String)
  socio: string; // Nombre del socio / cliente

  @Field(() => Int)
  importe: number; // C. Entregada (cantidad entregada)

  @Field(() => String)
  entrega: string; // Fecha de entrega (ISO / string)

  @Field(() => String)
  usuario: string; // Usr. Autorizacion (valor enviado en Excel)

  @Field(() => String)
  ejecutivo: string; // Nombre del ejecutivo resuelto desde R12Usuario (por R12Ni)

  @Field(() => String)
  categoria: string; // Tipo (columna Tipo del Excel)

  @Field(() => String)
  producto: string; // Producto / Categoria (columna Categoria del Excel)
}
