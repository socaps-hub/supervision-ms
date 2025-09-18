import { IsNumber, IsString } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';
import { Calificativo as Cal } from '@prisma/client';
import { Calificativo } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';

@InputType()
export class CreateSisconcapEvaluacionResumenFase1Input {
  // @Field(() => Int)
  // @IsNumber()
  // R21Folio: number;

  @Field(() => Int)
  @IsNumber()
  R21Ha: number;

  @Field(() => Int)
  @IsNumber()
  R21Rc: number;

  @Field(() => Calificativo)
  @IsString()
  R21Cal: Cal;

  @Field(() => String)
  @IsString()
  R21Obs: string;

  @Field(() => String)
  @IsString()
  R21Ejvo_id: string;
}
