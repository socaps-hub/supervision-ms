import { InputType, Field, Float, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IsUUID, IsString, IsNotEmpty, IsDate, IsOptional, IsEnum, IsBoolean, Length, MaxLength, MinLength, IsDecimal, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreatePrestamoInput {

  @Field(() => ID)
  @Length(8, 8)
  @IsString()
  R01NUM: string;

  @Field(() => ID)
  @IsUUID()
  R01Suc_id: string;

  @Field(() => String)
  @Length(1, 6)
  @IsString()
  R01Nso: string;
  
  @Field()
  @MaxLength(100)
  @IsString()
  R01Nom: string;

  @Field(() => ID)
  @IsUUID()
  R01Cat_id: string;

  @Field(() => ID)
  @IsUUID()
  R01Pro_id: string;

  @Field(() => Float)
  @IsNumber()
  R01Imp: number;

  @Field(() => String)
  @Length(2, 2)
  @IsString()
  R01Dir: string;

  @Field(() => ID)
  @IsUUID()
  R01SP_id: string;

  @Field(() => ID)
  @IsUUID()
  R01Ejvo_id: string;

  @Field(() => String)
  @IsString()  
  R01Fsol: string;
  
  @Field(() => String)
  @IsString()  
  R01FRec: string;
  
  @Field(() => String)
  @IsString()  
  R01FRev: string;
  
  @Field(() => String)
  @IsString()  
  R01FMov: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  R01ObsA?: string;
  
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  R01ObsM?: string;
  
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  R01ObsB?: string;
  
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  R01ObsT?: string;

  @Field()
  @IsString()
  R01Est: string;

  @Field()
  @IsBoolean()
  R01Activ: boolean;

  @Field(() => ID)
  @IsUUID()
  R01Coop_id: string;

}
