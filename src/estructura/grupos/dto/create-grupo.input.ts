import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateGrupoInput {

  @Field( () => String )
  @IsString()
  R02Nom: string
  
  @Field( () => ID )
  @IsUUID()
  R02Coop_id: string
}
