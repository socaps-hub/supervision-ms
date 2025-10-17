import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuditoriaService } from "./auditoria.service";
import { AuditoriaInput } from "./dto/inputs/auditoria.input";
import { Usuario } from "src/common/entities/usuario.entity";

@Controller()
export class AuditoriaHandler {

    constructor(
        private readonly _service: AuditoriaService,
    ) { }

    @MessagePattern('auditoria.validarPrestamosFromExcel')
    handleValidarPrestamosFromExcel(
        @Payload() { data, user }: { data: AuditoriaInput[], user: Usuario }
    ) {
        return this._service.validarPrestamosNoExistentes(data, user)
    }
    
}