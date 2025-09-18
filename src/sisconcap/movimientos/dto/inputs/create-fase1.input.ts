import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { CreateMovimientoInput } from './create-movimiento.input';
import { CreateSisconcapEvaluacionFase1Input } from 'src/sisconcap/fase1-registro/evaluacion-fase1/dto/inputs/create-sisconcap-evaluacion-fase1.input';
import { CreateSisconcapEvaluacionResumenFase1Input } from 'src/sisconcap/fase1-registro/resumen-fase1/dto/inputs/create-sisconcap-resumen-fase1.input';

@InputType()
export class CreateFase1Input {
  @Field(() => CreateMovimientoInput)
  @ValidateNested()
  @Type(() => CreateMovimientoInput)
  movimiento: CreateMovimientoInput;

  @Field(() => [CreateSisconcapEvaluacionFase1Input])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSisconcapEvaluacionFase1Input)
  evaluaciones: CreateSisconcapEvaluacionFase1Input[];

  @Field(() => CreateSisconcapEvaluacionResumenFase1Input)
  @ValidateNested()
  @Type(() => CreateSisconcapEvaluacionResumenFase1Input)
  resumen: CreateSisconcapEvaluacionResumenFase1Input;
}
