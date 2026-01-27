import { InputType, Field, Int } from '@nestjs/graphql';
import { Calificativo as Cal, Resolucion as Res } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { Calificativo, Resolucion } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

@InputType()
export class CreateResumenFase1Input {

  // @Field(() => String)
  // @IsString()
  // R06P_num: string;

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
