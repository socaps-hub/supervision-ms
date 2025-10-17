import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class AuditoriaInput {
  @Field(() => String)
  @IsString()
  numeroCredito: string;

  @Field(() => String)
  @IsString()
  tipo: string;

  @Field(() => String)
  @IsString()
  categoria: string;

  @Field(() => String)
  @IsString()
  fechaEntrega: string;

  @Field(() => String)
  @IsString()
  cantidadEntregada: string;

  @Field(() => String)
  @IsString()
  usrAutorizacion: string;

  @Field(() => String)
  @IsString()
  usrSolicitud: string;

  @Field(() => String)
  @IsString()
  sucursal: string;

  @Field(() => String)
  @IsString()
  numeroCag: string;

  @Field(() => String)
  @IsString()
  nombre: string;
}
