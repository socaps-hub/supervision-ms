import { Controller, UseInterceptors } from "@nestjs/common";
import { Fase1RevisionService } from "./fase1-revision.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "src/common/entities/usuario.entity";
import { CreateFase1RevisionInput } from "./dto/inputs/credito/create-fase1-revision.input";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";

@Controller()
export class Fase1RevisionHandler {

  constructor(private readonly _service: Fase1RevisionService) {}

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'auditoria-credito',
    action: AuditActionEnum.EXECUTE,
    eventName: 'supervision.auditoria.fase1.handleCreateOrUpdateFase1',
    entities: [
      { name: 'A02MuestraCreditoSeleccion', idPath: 'id' },
    ],
  })
  @MessagePattern('supervision.auditoria.fase1.handleCreateOrUpdateFase1')
  handleCreateOrUpdateFase1(
    @Payload() { input, user }: { input: CreateFase1RevisionInput, user: Usuario }
  ) {
    return this._service.createOrUpdateFase1( input, user )
  }

}