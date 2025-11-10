import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { MuestraCreditoSeleccion } from 'src/auditoria/credito/entities/muestra-credito-seleccion.entity';

@ObjectType()
export class MuestraSeleccionOutput {
  @Field(() => Int)
  A01Id: number;

  @Field(() => Date)
  A01FechaCreacion: Date;

  @Field(() => Float)
  A01MargenError: number;

  @Field(() => Float)
  A01NivelConfianza: number;

  @Field(() => Date)
  A01FechaInicio: Date;

  @Field(() => Date)
  A01FechaFinal: Date;

  @Field(() => Int)
  A01TamanoMuestra: number;

  @Field(() => Int)
  A01TamanoUniverso: number;

  @Field(() => Boolean)
  A01Finalizada: boolean;

  @Field(() => [MuestraCreditoSeleccion], { nullable: true })
  seleccionados?: MuestraCreditoSeleccion[];
}
