import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Grupo } from 'src/estructura/grupos/entities/grupo.entity';
import { Producto } from './producto.entity';
import { Sucursal } from './sucursal.entity';
import { Usuario } from './usuario.entity';

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

  @Field( () => [Sucursal], { nullable: true })
  sucursales?: Sucursal[]
  
  @Field( () => [Usuario], { nullable: true })
  usuarios?: Usuario[]
  
  @Field( () => [Producto], { nullable: true })
  productos?: Producto[]

  @Field( () => [Grupo], { nullable: true } )
  grupos?: Grupo[]

}
