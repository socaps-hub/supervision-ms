import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ValidEstadosAuditoria } from 'src/auditoria/enums/valid-estados.enum';

@InputType()
export class InventarioRevisionFilterInput {
    // Estado del expediente: 'No revisado' | 'Con revision' | 'Con seguimiento'
    @Field(() => ValidEstadosAuditoria)
    @IsString()
    estado: ValidEstadosAuditoria;

    // Filtro por sucursal del usuario o por toda la cooperativa
    @Field(() => Boolean, { defaultValue: true })
    @IsBoolean()
    @IsOptional()
    filterBySucursal?: boolean;

    // Paginación clásica (por si quieres usarla)
    @Field(() => Int, { defaultValue: 1 })
    @IsNumber()
    @IsOptional()
    page?: number;

    @Field(() => Int, { defaultValue: 50 })
    @IsNumber()
    @IsOptional()
    pageSize?: number;

    // Bandera general para paginar o no
    @Field(() => Boolean, { defaultValue: true })
    @IsBoolean()
    @IsOptional()
    paginado?: boolean;

    // Para virtual scroll de PrimeNG: event.first (offset)
    @Field(() => Int, {
        nullable: true,
        description: 'Offset real de PrimeNG (event.first). Si se envía, tiene prioridad sobre page.',
    })
    @IsNumber()
    @IsOptional()
    first?: number | null;

    // Búsqueda global (caja de texto)
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    searchText?: string;

    // Filtros por columna (PrimeNG)
    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    filters?: Record<string, any> | null;
}
