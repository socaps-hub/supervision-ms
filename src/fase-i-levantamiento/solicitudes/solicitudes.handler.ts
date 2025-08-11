import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { SolicitudesService } from './solicitudes.service';
import { CreatePrestamoInput } from './dto/create-solicitud.input';
import { UpdatePrestamoInput } from './dto/update-solicitud.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase1Input } from '../evaluaciones/dto/create-evaluacion-fase1.input';
import { CreateResumenFase1Input } from '../evaluaciones/resumen/dto/create-resumen-fase1.input';
import { ValidEstados } from './enums/valid-estados.enum';

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
    @Payload() { user, filterBySucursal }: { user: Usuario, filterBySucursal: boolean }
  ) {
    return this.solicitudesService.findAll(user, filterBySucursal);
  }

  @MessagePattern('supervision.solicitudes.getById')
  handleGetById(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.solicitudesService.findById(data.id, data.user);
  }

  @MessagePattern('supervision.solicitudes.getByEstado')
  handleGetByEstado(
    @Payload() data: { estado: ValidEstados; user: Usuario, filterBySucursal: boolean }
  ) {
    return this.solicitudesService.findByEstado(data.estado, data.user, data.filterBySucursal);
  }

  @MessagePattern('supervision.solicitudes.update')
  handleUpdate(
    @Payload() data: { updatePrestamoInput: UpdatePrestamoInput, user: Usuario }
  ) {
    return this.solicitudesService.update(data.updatePrestamoInput.id, data.updatePrestamoInput, data.user);
  }

  @MessagePattern('supervision.solicitudes.updateAll')
  async handleActualizarCompleto(
    @Payload() payload: {
      currentId: string,
      prestamo: UpdatePrestamoInput;
      evaluaciones: CreateEvaluacionFase1Input[];
      resumen: CreateResumenFase1Input;
      user: Usuario;
    }
  ) {
    
    return await this.solicitudesService.updateAll({
      currentId: payload.currentId,
      prestamo: payload.prestamo, 
      evaluaciones: payload.evaluaciones,
      resumen: payload.resumen
    },
    payload.user);
  }

  @MessagePattern('supervision.solicitudes.remove')
  handleRemove(
    @Payload() data: { id: string, user: Usuario }
  ) {
    return this.solicitudesService.remove(data.id, data.user);
  }

}
