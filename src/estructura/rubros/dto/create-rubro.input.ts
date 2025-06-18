import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

@InputType()
export class CreateRubroInput {
  
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  R03G_id: string; // ID del grupo al que pertenece el rubro

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  R03Nom: string; // Nombre del rubro
}
