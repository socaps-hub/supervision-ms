import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString, IsEnum, IsNumber } from 'class-validator';
import { Impacto } from '../enums/elemento.enum';

@InputType()
export class CreateElementoInput {

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  R04R_id: string; // ID del Rubro al que pertenece

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  R04Nom: string; // Nombre del elemento

  @Field(() => Impacto)
  @IsNotEmpty()
  @IsString()
  R04Imp: string; // Impacto: ALTO, MEDIO o BAJO

  @Field( () => Int, { defaultValue: 0 } )
  @IsNumber()
  R04Pond: number;
}
