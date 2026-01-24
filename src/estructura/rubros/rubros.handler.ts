import { Controller, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RubrosService } from './rubros.service';
import { CreateRubroInput } from './dto/create-rubro.input';
import { UpdateRubroInput } from './dto/update-rubro.input';
import { CreateManyRubrosFromExcelDto } from './dto/create-many-rubros-from-excel.dto';
import { ActivityLog } from 'src/common/decorators/activity-log.decorator';
import { AuditActionEnum } from 'src/common/enums/audit-action.enum';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AuditSourceEnum } from 'src/common/enums/audit-source.enum';

@Controller()
export class RubrosHandler {

  constructor(
    private readonly rubrosService: RubrosService
  ) { }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'rubros',
    action: AuditActionEnum.CREATE,
    eventName: 'supervision.rubros.create',
    entities: [
        { name: 'R03Rubro', idPath: 'R03Id' },
    ],
  })
  @MessagePattern('supervision.rubros.create')
  handleCreate(
    @Payload() { createRubroInput }: { createRubroInput: CreateRubroInput, user: Usuario }
  ) {
    return this.rubrosService.create(createRubroInput);
  }

  @MessagePattern('supervision.rubros.getAll')
  handleGetAll(
    @Payload('coopId') coopId: string
  ) {
    return this.rubrosService.findAll(coopId);
  }

  @MessagePattern('supervision.rubros.getById')
  handleFindById(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.rubrosService.findById(id);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'rubros',
    action: AuditActionEnum.UPDATE,
    eventName: 'supervision.rubros.update',
    entities: [
        { name: 'R03Rubro', idPath: 'R03Id' },
    ],
  })
  @MessagePattern('supervision.rubros.update')
  handleUpdate(
    @Payload() { updateRubroInput }: { updateRubroInput: UpdateRubroInput, user: Usuario }
  ) {
    return this.rubrosService.update(updateRubroInput.id, updateRubroInput);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'rubros',
    action: AuditActionEnum.DELETE,
    eventName: 'supervision.rubros.remove',
    entities: [
        { name: 'R03Rubro', idPath: 'R03Id' },
    ],
  })
  @MessagePattern('supervision.rubros.remove')
  handleRemove(
    @Payload() { id }: { id: string, user: Usuario }
  ) {
    return this.rubrosService.remove(id);
  }

  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({
    service: 'supervision-ms',
    module: 'grupos',
    action: AuditActionEnum.UPLOAD,
    source: AuditSourceEnum.JOB,
    eventName: 'supervision.rubros.createManyFromExcel',
    entities: [],
  })
  @MessagePattern('supervision.rubros.createManyFromExcel')
  handleCreateManyFromExcel(
    @Payload() { data, coopId }: { data: CreateManyRubrosFromExcelDto[], coopId: string, user: Usuario }
  ) {
    return this.rubrosService.createManyFromExcel( data, coopId )
  }

}
