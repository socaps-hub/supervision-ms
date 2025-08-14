import { Injectable } from '@nestjs/common';

import { ReporteFase1Service } from './fase1/fase1.service';
import { FiltroFechasInput } from '../common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response } from './dto/fase1/reporte-segmentado-f1.output';
import { DetalleAnomaliasF1Response } from './dto/fase1/detalle-anomalias-f1.output';
import { AnomaliasResumenResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1.output';
import { DetalleAnomaliasEjecutivoF1Response } from './dto/fase1/detalle-anomalias-f1-ejecutivo.output';
import { Usuario } from 'src/common/entities/usuario.entity';
import { DetalleAnomaliasIntegralEjecutivosResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1-ejecutivos.output';
import { ReporteFase2Response } from './dto/fase2/resultados-seguimiento.dto';
import { ReporteFase2Service } from './fase2/fase2.service';
import { ReporteFase3Response } from './dto/fase3/revision-desembolsos.dto';
import { ReporteFase3Service } from './fase3/fase3.service';
import { DetalleAnomaliasF3Response } from './dto/fase3/anomalias-desembolso.dto';
import { ReporteFase4Service } from './fase4/fase4.service';
import { ReporteFase4Response } from './dto/fase4/reporte-global.dto';

@Injectable()
export class ReportesService {

    constructor(
        private readonly _reporteFase1Service: ReporteFase1Service,
        private readonly _reporteFase2Service: ReporteFase2Service,
        private readonly _reporteFase3Service: ReporteFase3Service,
        private readonly _reporteFase4Service: ReporteFase4Service,
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

    // * FASE 2
    async getResultadosSeguimientoF2(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase2Response> {
        return await this._reporteFase2Service.getResultadosSeguimiento( input, user )
    }

    // * FASE 3
    async getRevisionDesembolsosF3(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase3Response> {
        return await this._reporteFase3Service.getRevisionDesembolsos( input, user )
    }

    async getDetalleAnomaliasF3(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasF3Response> {
        return await this._reporteFase3Service.getDetalleAnomaliasF3( input, user )
    }

    // * FASE 4
    async getReporteGlobalF4(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase4Response> {
        return await this._reporteFase4Service.getReporteGlobalF4( input, user )
    }

}
