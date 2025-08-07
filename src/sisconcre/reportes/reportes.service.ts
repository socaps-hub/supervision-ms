import { Injectable } from '@nestjs/common';
import { ReporteFase1Service } from './fase1/fase1.service';
import { FiltroFechasInput } from '../common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response } from './dto/fase1/reporte-segmentado-f1.output';
import { DetalleAnomaliasF1Response } from './dto/fase1/detalle-anomalias-f1.output';
import { AnomaliasResumenResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1.output';

@Injectable()
export class ReportesService {

    constructor(
        private readonly _reporteFase1Service: ReporteFase1Service
    ) {}

    async getReporteSegmentadoF1(input: FiltroFechasInput): Promise<ReporteSegmentadoFase1Response> {
        return await this._reporteFase1Service.getReporteSegmentadoF1( input )
    }

    async getDetalleAnomaliasF1(input: FiltroFechasInput): Promise<DetalleAnomaliasF1Response> {
        return await this._reporteFase1Service.getDetalleAnomalias( input )
    }

    async getDetalleAnomaliasIntegralProGruposF1(input: FiltroFechasInput): Promise<AnomaliasResumenResponseF1> {
        return await this._reporteFase1Service.getDetalleAnomaliasIntegralPorGrupos( input )
    }

}
