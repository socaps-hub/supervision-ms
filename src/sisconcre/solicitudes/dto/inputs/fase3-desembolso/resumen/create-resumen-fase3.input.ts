import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { Calificativo as Cal } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';
import { Calificativo } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';


@InputType()
export class CreateEvaluacionResumenFase3Input {
  
  @Field(() => Int)
  @IsNumber()
  R10Ha: number;
  
  @Field(() => Int)
  @IsNumber()
  R10Pendientes: number;
  
  @Field(() => Int)
  @IsNumber()
  R10Rc: number;

  @Field(() => Calificativo)
  @IsString()
  R10Cal: Cal;
  
  @Field()
  @IsString()
  R10Obs: string;
  
  @Field(() => ID)
  @IsString()
  R10Ev_por: string
}
