import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateMuestraSeleccionInput } from './create-muestra-seleccion.input';
import { IsNumber } from 'class-validator';

@InputType()
export class UpdateMuestraSeleccionInput extends PartialType(CreateMuestraSeleccionInput) {
  @Field(() => Int)
  @IsNumber()
  A01Id: number;
}
