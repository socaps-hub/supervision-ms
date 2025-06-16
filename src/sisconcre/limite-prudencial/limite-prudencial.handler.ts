
import { Controller} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LimitePrudencialService } from "../limite-prudencial/limite-prudencial.service";
import { CreateLimitePrudencialInput } from "../limite-prudencial/dto/inputs/create-limite-prudencial.input";
import { Usuario } from "src/common/entities/usuario.entity";

@Controller()
export class LimitePrudencialHandler {

    constructor(
        private readonly _service: LimitePrudencialService,
    ) { }

    @MessagePattern('supervision.limite-prudencial.create')
    handleCreate(
        @Payload() data: { createLimitePrudencialInput: CreateLimitePrudencialInput, user: Usuario }
    ) {
        return this._service.create( data.createLimitePrudencialInput, data.user )
    }

    @MessagePattern('supervision.limite-prudencial.getLast')
    handleGetLastLimitePrudencial(
        @Payload('usuario') usuario: Usuario,
    ) {
        return this._service.findLast(usuario);
    }

}