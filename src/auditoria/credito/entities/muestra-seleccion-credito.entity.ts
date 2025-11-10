import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Cooperativa } from 'src/common/entities/cooperativa.entity';
import { Usuario } from 'src/common/entities/usuario.entity';
import { MuestraCreditoSeleccion } from './muestra-credito-seleccion.entity';

@ObjectType()
export class MuestraSeleccionCredito {

  @Field(() => Int)
  A01Id: number;

  // Usuario que generó la muestra
  @Field(() => String)
  A01UsuarioId: string;

  @Field(() => Usuario, { nullable: true })
  usuario?: Usuario;

  // Cooperativa a la que pertenece la muestra
  @Field(() => String)
  A01CoopId: string;

  @Field(() => Cooperativa, { nullable: true })
  cooperativa?: Cooperativa;

  // Parámetros estadísticos
  @Field(() => Float)
  A01MargenError: number;

  @Field(() => Float)
  A01NivelConfianza: number;

  @Field(() => Date, { nullable: true })
  A01FechaInicio?: Date;

  @Field(() => Date, { nullable: true })
  A01FechaFinal?: Date;

  @Field(() => Date, { nullable: true })
  A01FechaCreacion?: Date;


  @Field(() => Int)
  A01TamanoMuestra: number;

  @Field(() => Int)
  A01TamanoUniverso: number;

  @Field(() => Boolean)
  A01Finalizada: boolean;

  // Créditos seleccionados (relación 1:N)
  @Field(() => [MuestraCreditoSeleccion], { nullable: true })
  seleccionados?: MuestraCreditoSeleccion[];
}

