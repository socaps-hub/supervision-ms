import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { GruposService } from "./grupos.service";
import { CreateGrupoInput } from "./dto/create-grupo.input";
import { UpdateGrupoInput } from "./dto/update-grupo.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { CreateManyGruposFromExcelDto } from "./dto/create-many-grupos-from-excel.dto";
import { GrupoTipo } from "./enums/grupo-type-enum";

@Controller()
export class GruposHandler {

    constructor(
        private readonly _service: GruposService,
    ) { }

    @MessagePattern('supervision.grupos.create')
    handleCreate(
        @Payload() data: { createGrupoInput: CreateGrupoInput }
    ) { 
        return this._service.create( data.createGrupoInput )
    }
    
    @MessagePattern('supervision.grupos.getAll')
    handleGetAll(
        @Payload() { coopId, type }: { coopId: string, type: GrupoTipo }
    ) {
        return this._service.findAll( coopId, type )
    }

    @MessagePattern('supervision.grupos.getAdminGroups')
    handleGetAdminGroups(
        @Payload('coopId', ParseUUIDPipe) coopId: string
    ) {
        return this._service.findAllAdminGroups( coopId )
    }

    @MessagePattern('supervision.grupos.getByName')
    handleGetByName(
        @Payload() { name, user }: { name: string, user: Usuario }
    ) {
        return this._service.findByName( name, user )
    }

    @MessagePattern('supervision.grupos.update')
    handleUpdate(
        @Payload('updateGrupoInput') updateGrupoInput: UpdateGrupoInput
    ) {
        return this._service.update( updateGrupoInput.id, updateGrupoInput )
    }
    
    @MessagePattern('supervision.grupos.remove')
    handleRemove(
        @Payload('id', ParseUUIDPipe) id: string
    ) {
        return this._service.remove( id )
    }

    @MessagePattern('supervision.grupos.createManyFromExcel')
    handleCreateManyFromExcel(
        @Payload() { data, coopId }: { data: CreateManyGruposFromExcelDto[], coopId: string }
    ) {
        return this._service.createManyFromExcel( data, coopId )
    }    

}