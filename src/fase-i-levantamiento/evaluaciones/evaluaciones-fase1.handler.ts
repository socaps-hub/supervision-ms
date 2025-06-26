import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Usuario } from 'src/common/entities/usuario.entity';
import { EvaluacionesFase1Service } from './evaluaciones-fase1.service';
import { CreateEvaluacionFase1Input } from './dto/create-evaluacion-fase1.input';
import { UpdateEvaluacionFase1Input } from './dto/update-evaluacion-fase1.input';

@Controller()
export class EvaluacionesFase1Handler {

  constructor(
    private readonly evaluacionesService: EvaluacionesFase1Service
  ) {}

  @MessagePattern('supervision.evaluaciones-fase1.create')
  handleCreate(
    @Payload() data: { input: CreateEvaluacionFase1Input, user: Usuario }
  ) {
    return this.evaluacionesService.create(data.input, data.user);
  }

  @MessagePattern('supervision.evaluaciones-fase1.createMany')
  handleCreateMany(
    @Payload() data: { inputs: CreateEvaluacionFase1Input[], user: Usuario }
  ) {
    return this.evaluacionesService.createMany(data.inputs, data.user);
  }

  @MessagePattern('supervision.evaluaciones-fase1.getAll')
  handleGetAll(
    @Payload() data: { prestamoId: string, user: Usuario }
  ) {
    return this.evaluacionesService.findAll(data.prestamoId, data.user);
  }

  @MessagePattern('supervision.evaluaciones-fase1.update')
  handleUpdate(
    @Payload() data: { input: UpdateEvaluacionFase1Input, user: Usuario }
  ) {
    return this.evaluacionesService.update(data.input.id, data.input, data.user);
  }

}
