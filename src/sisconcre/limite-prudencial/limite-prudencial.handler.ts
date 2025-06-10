
import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { LimitePrudencialService } from "../limite-prudencial/limite-prudencial.service";
import { UserArg } from "../common/dto/args/user.arg";
import { CreateLimitePrudencialInput } from "../limite-prudencial/dto/inputs/create-limite-prudencial.input";

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