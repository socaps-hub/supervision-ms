import { Controller } from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "src/common/entities/usuario.entity";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";
import { ResumenAnomaliasArgs } from "./dto/fase1/arg/resumen-anomalias.args";
import { SisconcapHistoricoFiltroInput } from "./dto/historicos/inputs/filtro-historico-reporte.input";

@Controller()
export class ReportesHandler {

    constructor(
        private readonly _service: ReportesService,
    ) { }

    // * FASE 1
    @MessagePattern('reportes-sisconcap.fase1.reporteSegmentado')
    handleGetReporteSegmentadoF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getReporteSegmentadoF1(input, user)
    }

    @MessagePattern('reportes-sisconcap.fase1.resumenAnomaliasSucAndEjecutivos')
    handleGetResumenAnomaliasSucAndEjecutivos(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getResumenAnomaliasSucAndEjecutivos(input, user)
    }

    @MessagePattern('reportes-sisconcap.fase1.resumenAnomaliasEjecutivosPorSucursal')
    handleGetResumenAnomaliasEjecutivosPorSucursal(
        @Payload() { resumenAnomaliasArgs, user }: { resumenAnomaliasArgs: ResumenAnomaliasArgs, user: Usuario }
    ) {
        return this._service.getResumenAnomaliasEjecutivosPorSucursal(resumenAnomaliasArgs, user)
    }

    @MessagePattern('reportes-sisconcap.fase1.resumenAnomaliasEjecutivosGlobal')
    handleGetResumenAnomaliasEjecutivosGlobal(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getResumenAnomaliasEjecutivosGlobal(input, user)
    }

    // * FASE 2
    @MessagePattern('reportes-sisconcap.fase2.resultadosSeguimiento')
    handleGetResultadosSeguimiento(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getResultadosSeguimiento(input, user)
    }

    // * FASE 3
    @MessagePattern('reportes-sisconcap.fase3.resultadosFinales')
    handleGetResultadosFinales(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getResultadosFinales(input, user)
    }

    // * HISTORICO
    @MessagePattern('reportes-sisconcap.historico')
    handleGetHistorico(
        @Payload() { input, user }: { input: SisconcapHistoricoFiltroInput, user: Usuario }
    ) {
        return this._service.getHistoricos(input, user)
    }

    // * BALANCE
    @MessagePattern('reportes-sisconcap.balance')
    handleGetBalance(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getBalance(input, user)
    }

}