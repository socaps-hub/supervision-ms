import { Injectable } from '@nestjs/common';
import { ReporteFase1Service } from './fase1/fase1.service';
import { FiltroFechasInput } from '../common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response } from './dto/fase1/reporte-segmentado-f1.output';
import { DetalleAnomaliasF1Response } from './dto/fase1/detalle-anomalias-f1.output';
import { AnomaliasResumenResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1.output';
import { DetalleAnomaliasEjecutivoF1Response } from './dto/fase1/detalle-anomalias-f1-ejecutivo.output';
import { Usuario } from 'src/common/entities/usuario.entity';
import { DetalleAnomaliasIntegralEjecutivosResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1-ejecutivos.output';

@Injectable()
export class ReportesService {

    constructor(
        private readonly _reporteFase1Service: ReporteFase1Service
    ) {}

    async getReporteSegmentadoF1(input: FiltroFechasInput, user: Usuario): Promise<ReporteSegmentadoFase1Response> {
        return await this._reporteFase1Service.getReporteSegmentadoF1( input, user )
    }

    async getDetalleAnomaliasF1(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasF1Response> {
        return await this._reporteFase1Service.getDetalleAnomalias( input, user )
    }

    async getDetalleAnomaliasIntegralProGruposF1(input: FiltroFechasInput, user: Usuario): Promise<AnomaliasResumenResponseF1> {
        return await this._reporteFase1Service.getDetalleAnomaliasIntegralPorGrupos( input, user )
    }

    async getDetalleAnomaliasPorEjecutivoF1(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasEjecutivoF1Response> {
        return await this._reporteFase1Service.getDetalleAnomaliasPorEjecutivo( input, user )
    }

    async getDetalleAnomaliasIntegralPorEjecutivoF1(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasIntegralEjecutivosResponseF1> {
        return await this._reporteFase1Service.getDetalleAnomaliasIntegralPorEjecutivos( input, user )
    }

}
