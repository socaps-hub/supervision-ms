import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Usuario {

  @Field( () => String, { name: 'id' })
  R12Id: string
  
  @Field( () => String, { name: 'usuario' })
  R12Ni: string
  
  @Field( () => String, { name: 'nombre' })
  R12Nom: string
  
  R12Password: string
  
  @Field( () => String, { name: 'sucursal_id' })
  R12Suc_id: string
  
  @Field( () => String, { name: 'rol' })
  R12Rol: string
  
  @Field( () => Boolean, { name: 'estado' })
  R12Activ: boolean
  
  @Field( () => Date, { name: 'creado_en' })
  R12Creado_en: Date

}
