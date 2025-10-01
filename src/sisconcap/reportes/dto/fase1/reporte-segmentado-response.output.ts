import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReporteSucursalResponse {
    @Field(() => String)
    sucursal: string;

    @Field(() => Int)
    movimientos: number;

    @Field(() => Int)
    conteo: number;

    @Field(() => Int)
    movimientosSuc: number;

    @Field(() => Int)
    sinObservacion: number;

    @Field(() => Int)
    conObservacion: number;

    @Field(() => Int)
    anomalias: number;
}

@ObjectType()
export class ReporteCategoriaResponse {
    @Field(() => [ReporteSucursalResponse])
    sucursales: ReporteSucursalResponse[];

    @Field(() => Int)
    movimientos: number;

    @Field(() => Int)
    conteo: number;

    @Field(() => Int)
    sinObservacion: number;

    @Field(() => Int)
    conObservacion: number;

    @Field(() => Int)
    anomalias: number;
}

@ObjectType()
export class ReporteFase1Response {
    @Field(() => ReporteCategoriaResponse)
    ingresos: ReporteCategoriaResponse;

    @Field(() => ReporteCategoriaResponse)
    aperturas: ReporteCategoriaResponse;

    @Field(() => ReporteCategoriaResponse)
    actualizaciones: ReporteCategoriaResponse;

    @Field(() => ReporteCategoriaResponse)
    bajas: ReporteCategoriaResponse;
}
