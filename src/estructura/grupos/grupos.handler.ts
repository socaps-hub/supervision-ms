import { Controller, ParseUUIDPipe} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { GruposService } from "./grupos.service";
import { CreateGrupoInput } from "./dto/create-grupo.input";
import { UpdateGrupoInput } from "./dto/update-grupo.input";

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
        @Payload('coopId', ParseUUIDPipe) coopId: string
    ) {
        return this._service.findAll( coopId )
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
    

}