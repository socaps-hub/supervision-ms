import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUsuarioInput {

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  R12Ni: string
  
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  R12Nom: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  R12Password: string
  
  @Field(() => String)
  @IsUUID()
  R12Suc_id: string

  @Field(() => String)
  @IsUUID()
  R12Coop_id: string
  
  @Field(() => String )
  @IsString()
  @IsIn(['ejecutivo', 'supervisor', 'admin'])
  R12Rol: string 

}
