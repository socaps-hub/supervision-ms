import { InputType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class GetCreditosSeleccionadosInput {
  @Field(() => Int)
  @IsNumber()
  muestraId: number;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  filtrarPorSucursal?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  paginado?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
