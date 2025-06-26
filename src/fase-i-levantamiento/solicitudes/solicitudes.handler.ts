import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { SolicitudesService } from './solicitudes.service';
import { CreatePrestamoInput } from './dto/create-solicitud.input';
import { UpdatePrestamoInput } from './dto/update-solicitud.input';
import { Usuario } from 'src/common/entities/usuario.entity';

@Controller()
export class SolicitudesHandler {

  constructor(
    private readonly solicitudesService: SolicitudesService
  ) { }

  @MessagePattern('supervision.solicitudes.create')
  handleCreate(
    @Payload() data: { createPrestamoInput: CreatePrestamoInput, user: Usuario }
  ) {
    return this.solicitudesService.create(data.createPrestamoInput, data.user);
  }

  @MessagePattern('supervision.solicitudes.getAll')
  handleGetAll(
    @Payload('user') user: Usuario
  ) {
    return this.solicitudesService.findAll(user);
  }

  @MessagePattern('supervision.solicitudes.getById')
  handleGetById(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.solicitudesService.findById(data.id, data.user);
  }

  @MessagePattern('supervision.solicitudes.update')
  handleUpdate(
    @Payload() data: { updatePrestamoInput: UpdatePrestamoInput, user: Usuario }
  ) {
    return this.solicitudesService.update(data.updatePrestamoInput.id, data.updatePrestamoInput, data.user);
  }

  @MessagePattern('supervision.solicitudes.remove')
  handleRemove(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.solicitudesService.remove(data.id, data.user);
  }

}
