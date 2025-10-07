import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ResumenAnomaliasSucAndEjecutivosEjecutivoResponse {
    @Field(() => String)
    user: string;

    @Field(() => String)
    nombre: string;

    @Field(() => Int)
    movimientos: number;

    @Field(() => Int)
    anomalias: number;

    @Field(() => Int)
    erroresPromedio: number;

    @Field(() => Int)
    correctos: number;

    @Field(() => Int)
    pctCorrectos: number;

    @Field(() => Int)
    deficientes: number;

    @Field(() => Int)
    pctDeficientes: number;
}

@ObjectType()
export class ResumenAnomaliasSucAndEjecutivosSucursalResponse {
    @Field(() => String)
    sucursal: string;

    @Field(() => Int)
    movimientos: number;

    @Field(() => Int)
    anomalias: number;

    @Field(() => Int)
    erroresPromedio: number;

    @Field(() => Int)
    correctos: number;

    @Field(() => Int)
    pctCorrectos: number;

    @Field(() => Int)
    deficientes: number;

    @Field(() => Int)
    pctDeficientes: number;

    @Field(() => [ResumenAnomaliasSucAndEjecutivosEjecutivoResponse], { nullable: 'itemsAndList' })
    ejecutivos?: ResumenAnomaliasSucAndEjecutivosEjecutivoResponse[];
}

@ObjectType()
export class ResumenAnomaliasSucAndEjecutivosCategoriaResponse {
    @Field(() => [ResumenAnomaliasSucAndEjecutivosSucursalResponse], { nullable: 'itemsAndList' })
    sucursales: ResumenAnomaliasSucAndEjecutivosSucursalResponse[];

    // Totales globales de la categoría (puedes usarlos para footer)
    @Field(() => Int)
    movimientos: number;

    @Field(() => Int)
    anomalias: number;

    @Field(() => Int)
    erroresPromedio: number;

    @Field(() => Int)
    correctos: number;

    @Field(() => Int)
    pctCorrectos: number;

    @Field(() => Int)
    deficientes: number;

    @Field(() => Int)
    pctDeficientes: number;
}

@ObjectType()
export class ResumenAnomaliasSucAndEjecutivosResponseDto {
    @Field(() => ResumenAnomaliasSucAndEjecutivosCategoriaResponse)
    ingresos: ResumenAnomaliasSucAndEjecutivosCategoriaResponse;

    @Field(() => ResumenAnomaliasSucAndEjecutivosCategoriaResponse)
    aperturas: ResumenAnomaliasSucAndEjecutivosCategoriaResponse;

    @Field(() => ResumenAnomaliasSucAndEjecutivosCategoriaResponse)
    actualizaciones: ResumenAnomaliasSucAndEjecutivosCategoriaResponse;

    @Field(() => ResumenAnomaliasSucAndEjecutivosCategoriaResponse)
    bajas: ResumenAnomaliasSucAndEjecutivosCategoriaResponse;
}
