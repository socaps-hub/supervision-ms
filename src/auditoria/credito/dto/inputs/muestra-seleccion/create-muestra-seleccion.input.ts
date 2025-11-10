import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateMuestraSeleccionInput {
  @Field(() => Float)
  @IsNumber()
  A01MargenError: number;

  @Field(() => Float)
  @IsNumber()
  A01NivelConfianza: number;

  @Field(() => Date)
  @IsDate()
  A01FechaInicio: Date;

  @Field(() => Date)
  @IsDate()
  A01FechaFinal: Date;

  @Field(() => Int)
  @IsNumber()
  A01TamanoMuestra: number;

  @Field(() => Int)
  @IsNumber()
  A01TamanoUniverso: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  A01Finalizada?: boolean;
}
