import { InputType, Field, Int } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { Calificativo, Resolucion } from '../../enums/evaluacion.enum';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateResumenFase1Input {

  @Field(() => String)
  @IsString()
  R06P_num: string;

  @Field(() => Int)
  @IsNumber()
  R06Ha: number;
  
  @Field(() => Int)
  @IsNumber()
  R06Hm: number;
  
  @Field(() => Int)
  @IsNumber()
  R06Hb: number;
  
  @Field(() => Int)
  @IsNumber()
  R06Rc: number;

  @Field(() => Calificativo)
  @IsString()
  R06Cal: Cal;
  
  @Field(() => Resolucion)
  @IsString()
  R06Res: Res;
}
