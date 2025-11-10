import { InputType, Field, Int } from '@nestjs/graphql';
import { ParametrosMuestraInput } from './muestra-params.input';
import { IsNumber, IsOptional } from 'class-validator';

@InputType()
export class ParametrosMuestraExtendInput extends ParametrosMuestraInput {
  @Field(() => Int, { nullable: true, description: 'ID de la muestra en caso de edición' })
  @IsNumber()
  @IsOptional()
  muestraId?: number;

  @Field(() => Int, { nullable: true, description: 'ID de la muestra en caso de edición' })
  @IsNumber()
  @IsOptional()
  first?: number;
}
