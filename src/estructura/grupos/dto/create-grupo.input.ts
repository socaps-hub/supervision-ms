import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { GrupoTipo as GrupoType } from '@prisma/client';
import { IsString, IsUUID } from 'class-validator';
import { GrupoTipo } from '../enums/grupo-type-enum';

@InputType()
export class CreateGrupoInput {

  @Field( () => String )
  @IsString()
  R02Nom: string
  
  @Field( () => ID )
  @IsUUID()
  R02Coop_id: string

  @Field(() => GrupoTipo)
  @IsString()
  R02Tipo: GrupoType

}
