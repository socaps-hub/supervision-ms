import { InputType, Field, Float, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { GraphQLJSON } from "graphql-scalars"; // 🔹 para manejar filtros complejos
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";

@InputType()
export class ParametrosMuestraInput {
  @Field(() => FiltroFechasInput)
  @ValidateNested()
  @Type(() => FiltroFechasInput)
  filtro: FiltroFechasInput;

  @Field(() => Float)
  @IsNumber()
  margenError: number; // ej. 5 (%)

  @Field(() => Float)
  @IsNumber()
  nivelConfianza: number; // ej. 95 (%)

  @Field(() => Boolean, { nullable: true, defaultValue: true })
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

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  searchText?: string; // 🔹 buscador global (debounced)

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: Record<string, any>; // 🔹 filtros por columna (PrimeNG)
}
