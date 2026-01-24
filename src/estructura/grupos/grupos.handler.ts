import { Controller, ParseUUIDPipe, UseInterceptors} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { GruposService } from "./grupos.service";
import { CreateGrupoInput } from "./dto/create-grupo.input";
import { UpdateGrupoInput } from "./dto/update-grupo.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { CreateManyGruposFromExcelDto } from "./dto/create-many-grupos-from-excel.dto";
import { GrupoTipo } from "./enums/grupo-type-enum";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";
import { AuditSourceEnum } from "src/common/enums/audit-source.enum";

@Controller()
export class GruposHandler {

    constructor(
        private readonly _service: GruposService,
    ) { }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'grupos',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.grupos.create',
        entities: [
            { name: 'R02Grupo', idPath: 'R02Id' },
        ],
    })
    @MessagePattern('supervision.grupos.create')
    handleCreate(
        @Payload() data: { createGrupoInput: CreateGrupoInput, user: Usuario }
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

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'grupos',
        action: AuditActionEnum.UPDATE,
        eventName: 'supervision.grupos.update',
        entities: [
            { name: 'R02Grupo', idPath: 'R02Id' },
        ],
    })
    @MessagePattern('supervision.grupos.update')
    handleUpdate(
        @Payload() { updateGrupoInput }: { updateGrupoInput: UpdateGrupoInput, user: Usuario }
    ) {
        return this._service.update( updateGrupoInput.id, updateGrupoInput )
    }
    
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'grupos',
        action: AuditActionEnum.DELETE,
        eventName: 'supervision.grupos.remove',
        entities: [
            { name: 'R02Grupo', idPath: 'R02Id' },
        ],
    })
    @MessagePattern('supervision.grupos.remove')
    handleRemove(
        @Payload() { id }: { id: string, user: Usuario }
    ) {
        return this._service.remove( id )
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'grupos',
        action: AuditActionEnum.UPLOAD,
        source: AuditSourceEnum.JOB,
        eventName: 'supervision.grupos.createManyFromExcel',
        entities: [],
    })
    @MessagePattern('supervision.grupos.createManyFromExcel')
    handleCreateManyFromExcel(
        @Payload() { data, coopId }: { data: CreateManyGruposFromExcelDto[], coopId: string, user: Usuario }
    ) {
        return this._service.createManyFromExcel( data, coopId )
    }    

}