import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FiltroFechasInput } from "../common/dto/filtro-fechas.input";

@Controller()
export class ReportesHandler {

    constructor(
        private readonly _service: ReportesService,
    ) { }

    @MessagePattern('reportes.fase1.reporteSegmentado')
    handleGetReporteSegmentadoF1(
        @Payload() { input }: { input: FiltroFechasInput }
    ) { 
        return this._service.getReporteSegmentadoF1( input )
    }

    @MessagePattern('reportes.fase1.detalleAnomalias')
    handleGetDetalleAnomaliasF1(
        @Payload() { input }: { input: FiltroFechasInput }
    ) { 
        return this._service.getDetalleAnomaliasF1( input )
    }

    @MessagePattern('reportes.fase1.detalleAnomaliasIntegralF1')
    handleGetDetalleAnomaliasIntegralF1(
        @Payload() { input }: { input: FiltroFechasInput }
    ) { 
        return this._service.getDetalleAnomaliasIntegralProGruposF1( input )
    }

}