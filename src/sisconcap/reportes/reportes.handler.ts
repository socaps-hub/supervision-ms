import { Controller } from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "src/common/entities/usuario.entity";
import { FiltroFechasInput } from "src/sisconcre/common/dto/filtro-fechas.input";

@Controller()
export class ReportesHandler {

    constructor(
        private readonly _service: ReportesService,
    ) { }

    @MessagePattern('reportes-sisconcap.fase1.reporteSegmentado')
    handleGetReporteSegmentadoF1(
        @Payload() { input, user }: { input: FiltroFechasInput, user: Usuario }
    ) {
        return this._service.getReporteSegmentadoF1(input, user)
    }

}