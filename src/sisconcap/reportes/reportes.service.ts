import { Injectable } from '@nestjs/common';
import { ReporteFase1Service } from './fase1/fase1.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';
import { ReporteFase1Response } from './dto/fase1/reporte-segmentado-response.output';

@Injectable()
export class ReportesService {

    constructor(
        private readonly _reporteFase1Service: ReporteFase1Service,
    ) { }

    async getReporteSegmentadoF1(input: FiltroFechasInput, user: Usuario): Promise<ReporteFase1Response> {
        return await this._reporteFase1Service.getReporteSegmentado(input, user)
    }

}
