import { Controller, ParseUUIDPipe } from "@nestjs/common";
import { UsuariosService } from "../usuarios/usuarios.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ValidRoles } from "src/common/valid-roles.enum";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { CreateUsuarioInput } from "../usuarios/dto/inputs/create-usuario.input";

@Controller()
export class UsuariosHandler {

    constructor(
        private readonly _usuariosService: UsuariosService
    ) { }

    @MessagePattern('supervision.usuarios.create')
    handleCreateUsuario(
        @Payload() data: { createUsuarioInput: CreateUsuarioInput, usuario: Usuario },
    ) {
        return this._usuariosService.create( data.createUsuarioInput, data.usuario );
    }

    @MessagePattern('supervision.usuarios.getAll')
    handleGetAll(
        @Payload() data: { role: ValidRoles, usuario: Usuario }
    ) {
        return this._usuariosService.findAll( data.role, data.usuario );
    }

    @MessagePattern('supervision.usuarios.getByNI')
    handleGetByNI(
        @Payload() data : { ni: string, withSucursales: boolean }
    ) {
        return this._usuariosService.findByNI(data.ni.toUpperCase(), data.withSucursales);
    }

    @MessagePattern('supervision.usuarios.getByID')
    handleGetByID(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._usuariosService.findByID(id);
    }
    
    @MessagePattern('supervision.usuarios.desactivate')
    handleDesactivateUser(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._usuariosService.desactivate(id);
    }

    @MessagePattern('supervision.usuarios.activate')
    handleActivateUser(
        @Payload('userNI') userNI: string
    ) {
        return this._usuariosService.activate(userNI.toUpperCase());
    }
}