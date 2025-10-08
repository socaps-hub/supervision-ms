import { Injectable } from '@nestjs/common';
import { ReporteFase1Service } from './fase1/fase1.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';
import { ReporteFase1Response } from './dto/fase1/reporte-segmentado-response.output';
import { ResumenAnomaliasSucAndEjecutivosCategoriaResponse, ResumenAnomaliasSucAndEjecutivosEjecutivoResponse, ResumenAnomaliasSucAndEjecutivosResponseDto } from './dto/fase1/resumen-anomalias-suc-with-ejecutivos-response.output';
import { ResumenAnomaliasArgs } from './dto/fase1/arg/resumen-anomalias.args';
import { ResultadosSeguimientoResponse } from './dto/fase2/resultados-seguimiento-response.output';
import { ReporteFase2Service } from './fase2/fase2.service';
import { ReporteFase3Service } from './fase3/fase3.service';

@Injectable()
export class ReportesService {

    constructor(
        private readonly _reporteFase1Service: ReporteFase1Service,
        private readonly _reporteFase2Service: ReporteFase2Service,
        private readonly _reporteFase3Service: ReporteFase3Service,
    ) { }

    // * FASE 1
    async getReporteSegmentadoF1(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase1Response> {
        return await this._reporteFase1Service.getReporteSegmentado(input, user)
    }

    async getResumenAnomaliasSucAndEjecutivos(input: FiltroFechasInput, user: Usuario): Promise<ResumenAnomaliasSucAndEjecutivosResponseDto> {
        return await this._reporteFase1Service.getResumenAnomaliasSucursales(input, user);
    }

    async getResumenAnomaliasEjecutivosPorSucursal(
        resumenAnomaliasArgs: ResumenAnomaliasArgs,
        user: Usuario,
    ): Promise<ResumenAnomaliasSucAndEjecutivosEjecutivoResponse[]> {
        return await this._reporteFase1Service.getResumenAnomaliasEjecutivosPorSucursal(resumenAnomaliasArgs, user);
    }

    async getResumenAnomaliasEjecutivosGlobal(input: FiltroFechasInput, user: Usuario): Promise<ResumenAnomaliasSucAndEjecutivosCategoriaResponse> {
        return await this._reporteFase1Service.getResumenAnomaliasGlobalAgrupadoPorSucursal(input, user)
    }

    // * FASE 2
    async getResultadosSeguimiento(input: FiltroFechasInput, user: Usuario): Promise<ResultadosSeguimientoResponse> {
        return await this._reporteFase2Service.getResultadosSeguimiento(input, user)
    }

    // * FASE 3
    async getResultadosFinales(input: FiltroFechasInput, user: Usuario): Promise<ResultadosSeguimientoResponse> {
        return await this._reporteFase3Service.getResultadosFinales(input, user)
    }

}
