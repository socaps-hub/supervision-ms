import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ValidEstados } from "../enums/valid-estados.enum";
import { GraphQLJSON } from "graphql-scalars";

@InputType()
export class InventarioSolicitudesFilterInput {

    @Field( () => ValidEstados, { nullable: true })
    @IsString()
    @IsOptional()
    estado?: ValidEstados;
    
    // Filtro por sucursal del usuario o por toda la cooperativa
    @Field(() => Boolean, { defaultValue: true })
    @IsBoolean()
    @IsOptional()
    filterBySucursal?: boolean;
    
    // Búsqueda global (caja de texto)
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    searchText?: string;

    // Filtros por columna (PrimeNG)
    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    filters?: Record<string, any> | null;

    // Bandera general para paginar o no
    @Field(() => Boolean, { defaultValue: true })
    @IsBoolean()
    @IsOptional()
    paginado?: boolean;

    @Field(() => Int, { defaultValue: 1 })
    @IsNumber()
    @IsOptional()
    page?: number;

    @Field(() => Int, { defaultValue: 50 })
    @IsNumber()
    @IsOptional()
    pageSize?: number;

    // Para virtual scroll de PrimeNG: event.first (offset)
    @Field(() => Int, {
        nullable: true,
        description: 'Offset real de PrimeNG (event.first). Si se envía, tiene prioridad sobre page.',
    })
    @IsNumber()
    @IsOptional()
    first?: number | null;
}
