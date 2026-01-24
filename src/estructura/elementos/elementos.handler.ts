import { Controller, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ElementosService } from './elementos.service';
import { CreateElementoInput } from './dto/create-elemento.input';
import { UpdateElementoInput } from './dto/update-elemento.input';
import { CreateManyElementoFromExcelDto } from './dto/create-many-elementos-from-excel.dto';
import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { AuditActionEnum } from 'src/common/enums/audit-action.enum';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AuditSourceEnum } from 'src/common/enums/audit-source.enum';

@Controller()
export class ElementosHandler {

  constructor(
    private readonly elementosService: ElementosService
  ) { }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'elementos',
    action: AuditActionEnum.CREATE,
    eventName: 'supervision.elementos.create',
    entities: [
        { name: 'R04Elemento', idPath: 'R04Id' },
    ],
  })
  @MessagePattern('supervision.elementos.create')
  handleCreate(
    @Payload() { createElementoInput }: { createElementoInput: CreateElementoInput, user: Usuario }
  ) {
    return this.elementosService.create(createElementoInput);
  }

  @MessagePattern('supervision.elementos.getAll')
  handleFindAll(
    @Payload('rubroId', ParseUUIDPipe) rubroId: string
  ) {
    return this.elementosService.findAll(rubroId);
  }

  @MessagePattern('supervision.elementos.getById')
  handleFindById(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.elementosService.findById(id);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'elementos',
    action: AuditActionEnum.UPDATE,
    eventName: 'supervision.elementos.update',
    entities: [
        { name: 'R04Elemento', idPath: 'R04Id' },
    ],
  })
  @MessagePattern('supervision.elementos.update')
  handleUpdate(
    @Payload() { updateElementoInput }: { updateElementoInput: UpdateElementoInput, user: Usuario }
  ) {
    return this.elementosService.update(updateElementoInput.id, updateElementoInput);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'elementos',
    action: AuditActionEnum.DELETE,
    eventName: 'supervision.elementos.remove',
    entities: [
        { name: 'R04Elemento', idPath: 'R04Id' },
    ],
  })
  @MessagePattern('supervision.elementos.remove')
  handleRemove(
    @Payload() { id }: { id: string, user: Usuario }
  ) {
    return this.elementosService.remove(id);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'grupos',
    action: AuditActionEnum.UPLOAD,
    source: AuditSourceEnum.JOB,
    eventName: 'supervision.elementos.createManyFromExcel',
    entities: [],
  })
  @MessagePattern('supervision.elementos.createManyFromExcel')
  handleCreateManyFromExcel(
    @Payload() { data, rubroId }: { data: CreateManyElementoFromExcelDto[],  rubroId: string, user: Usuario }
  ) {
    return this.elementosService.createManyFromExcel( data, rubroId )
  }
}
