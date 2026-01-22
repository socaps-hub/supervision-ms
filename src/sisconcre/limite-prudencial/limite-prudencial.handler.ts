
import { Controller, Logger, UseInterceptors} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LimitePrudencialService } from "../limite-prudencial/limite-prudencial.service";
import { CreateLimitePrudencialInput } from "../limite-prudencial/dto/inputs/create-limite-prudencial.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";

@Controller()
export class LimitePrudencialHandler {

    private readonly _logger = new Logger('LimitePrudencialHandler')

    constructor(
        private readonly _service: LimitePrudencialService,
    ) { }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'limite-prudencial',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.limite-prudencial.create',
        entities: [
            { name: 'R18LimitePrudencial', idPath: 'limitePrudencialId' },
        ],
    })
    @MessagePattern('supervision.limite-prudencial.create')
    async handleCreate(
        @Payload() data: { createLimitePrudencialInput: CreateLimitePrudencialInput, user: Usuario }
    ) {
        try {

            const result = await this._service.create( data.createLimitePrudencialInput, data.user )

            return {
                success: true,
                message: 'Limite prudencial creado exitosamente.',
                ...result,
            }
            
        } catch (error) {
            this._logger.error('❌ Error en LimitePrudencialHandler.handleCreate', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear/actualizar el limite prudencial.',
            };
        }        
    }

    @MessagePattern('supervision.limite-prudencial.getLast')
    handleGetLastLimitePrudencial(
        @Payload('usuario') usuario: Usuario,
    ) {
        return this._service.findLast(usuario);
    }

}