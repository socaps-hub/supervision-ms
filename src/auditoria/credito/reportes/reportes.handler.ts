import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ReportesService } from "./reportes.service";
import { Usuario } from "src/common/entities/usuario.entity";

@Controller()
export class ReportesHandler {

    constructor(
        private readonly _service: ReportesService,
    ) { }

    // * FASE 1
    @MessagePattern('reportes-acredito.fase1.reporteF1ByMuestra')
    handleGetReporteFase1ByMuestra(
        @Payload() { muestraId, user }: { muestraId: number, user: Usuario }
    ) {
        return this._service.getReporteFase1ByMuestra(muestraId, user)
    }

    @MessagePattern('reportes-acredito.fase1.reporteF1ByClasificacion')
    handleGetReporteFase1ByClasificacion(
        @Payload() { muestraId, user }: { muestraId: number, user: Usuario }
    ) {
        return this._service.getReporteFase1ByClasificacion(muestraId, user)
    }

}