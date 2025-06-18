import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Grupo {
 
  @Field( () => String )
  R02Id: string
  
  @Field( () => String )
  R02Nom: string
  
  // @Field( () => String )
  R02Coop_id: string
  
  @Field(() => GraphQLISODateTime, { nullable: true })
  R02Creado_en: Date
  
  @Field(() => GraphQLISODateTime, { nullable: true })
  R02Actualizado_en: Date
  
  // @Field( () => Cooperativa )
  // cooperativa: Cooperativa

  // rubros: 

}
