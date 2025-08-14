import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class ReporteFase3Sucursal {
    @Field()
    sucursal: string;

    @Field(() => Int)
    solicitudesNum: number;

    @Field(() => Int)
    correctas: number;
    @Field(() => Int)
    correctasPct: number;

    @Field(() => Int)
    deficientes: number;
    @Field(() => Int)
    deficientesPct: number;

    @Field(() => Int)
    pendientes: number;
    @Field(() => Int)
    pendientesPct: number;

    @Field(() => Int)
    hallazgosNum: number;

    @Field(() => Int)
    hallazgosPendientes: number;
}

@ObjectType()
export class ReporteFase3Response {
    @Field(() => [ReporteFase3Sucursal])
    sucursales: ReporteFase3Sucursal[];

    @Field(() => Int)
    totalSolicitudesNum: number;

    @Field(() => Int)
    totalCorrectas: number;
    @Field(() => Int)
    totalDeficientes: number;
    @Field(() => Int)
    totalPendientes: number;

    @Field(() => Int)
    totalHallazgosNum: number;
    @Field(() => Int)
    totalHallazgosPendientes: number;

    @Field(() => Int)
    pctCorrectasGlobal: number;
    @Field(() => Int)
    pctDeficientesGlobal: number;
    @Field(() => Int)
    pctPendientesGlobal: number;
}
