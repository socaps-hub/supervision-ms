import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Cooperativa } from 'src/common/entities/cooperativa.entity';

@ObjectType()
export class LimitePrudencial {
  
  @Field( () => String )
  R18Id: string 
  
  @Field( () => Int )
  R18Importe: number 
  
  @Field( () => String )
  R18Coop_id: string 
  
  @Field( () => Date )
  R18Creado_en: Date 
  
  @Field( () => Date )
  R18Actualizado_en: Date 
  
  @Field( () => Cooperativa )
  cooperativa: Cooperativa


}
