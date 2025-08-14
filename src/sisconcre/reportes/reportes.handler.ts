import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FiltroFechasInput } from "../common/dto/filtro-fechas.input";
import { Usuario } from "src/common/entities/usuario.entity";

@Controller()
export class ReportesHandler {

    constructor(
        private readonly _service: ReportesService,
    ) { }

    @MessagePattern('reportes.fase1.reporteSegmentado')
    handleGetReporteSegmentadoF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getReporteSegmentadoF1( input, user )
    }

    @MessagePattern('reportes.fase1.detalleAnomalias')
    handleGetDetalleAnomaliasF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getDetalleAnomaliasF1( input, user )
    }

    @MessagePattern('reportes.fase1.detalleAnomaliasIntegralF1')
    handleGetDetalleAnomaliasIntegralF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getDetalleAnomaliasIntegralProGruposF1( input, user )
    }

    @MessagePattern('reportes.fase1.detalleAnomaliasPorEjecutivoF1')
    handleGetDetalleAnomaliasPorEjecutivoF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getDetalleAnomaliasPorEjecutivoF1( input, user )
    }

    @MessagePattern('reportes.fase1.detalleAnomaliasIntegralPorEjecutivoF1')
    handleGetDetalleAnomaliasIntegralPorEjecutivoF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getDetalleAnomaliasIntegralPorEjecutivoF1( input, user )
    }

    // * REPORTES FASE 2
    @MessagePattern('reportes.fase2.resultadosSeguimientoF2')
    handleGetResultadosSeguimientoF2(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getResultadosSeguimientoF2( input, user )
    }

    // * REPORTES FASE 3
    @MessagePattern('reportes.fase3.revisionDesembolsosF3')
    handleGetRevisionDesembolsos(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getRevisionDesembolsosF3( input, user )
    }

    @MessagePattern('reportes.fase3.detalleAnomaliasF3')
    handleGetDetalleAnomaliasF3(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getDetalleAnomaliasF3( input, user )
    }

    // * REPORTES FASE 4
    @MessagePattern('reportes.fase4.reporteGlobalF4')
    handleGetReporteGlobalF4(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) { 
        return this._service.getReporteGlobalF4( input, user )
    }

}