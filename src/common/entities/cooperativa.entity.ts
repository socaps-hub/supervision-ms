import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Sucursal } from './sucursal.entity';
import { Producto } from './producto.entity';

@ObjectType()
export class Cooperativa {

  @Field( () => ID )
  R17Id: string
  
  @Field( () => String )
  R17Nom: string
  
  @Field( () => Boolean )
  R17Activ: boolean
  
  @Field( () => String )
  R17Logo: string
  
  @Field( () => Date )
  R17Creada_en: Date

  @Field( () => [Sucursal])
  sucursales: Sucursal[]

  @Field( () => [Producto])
  productos: Producto[]

}
