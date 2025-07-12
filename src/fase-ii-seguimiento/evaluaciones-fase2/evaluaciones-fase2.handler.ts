import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

import { EvaluacionesFase2Service } from './evaluaciones-fase2.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase2Input } from './dto/inputs/create-evaluacion-fase2.input';
import { UpdateEvaluacionFase2Input } from './dto/inputs/update-evaluacion-fase2.input';

@Controller()
export class EvaluacionesFase2Handler {
  constructor(private readonly service: EvaluacionesFase2Service) {}

  @MessagePattern('supervision.evaluacion-fase2.createMany')
  handleCreateMany(
    @Payload() { inputs, user }: { inputs: CreateEvaluacionFase2Input[]; user: Usuario }
  ) {
    return this.service.createMany(inputs, user);
  }

  @MessagePattern('supervision.evaluacion-fase2.findAll')
  handleGetAll(
    @Payload() { prestamoId, user }: { prestamoId: string; user: Usuario }
  ) {
    return this.service.findAll(prestamoId, user);
  }

  @MessagePattern('supervision.evaluacion-fase2.update')
  handleUpdate(
    @Payload() { input, user }: { input: UpdateEvaluacionFase2Input; user: Usuario }
  ) {
    return this.service.update(input.id, input, user);
  }

  @MessagePattern('supervision.evaluacion-fase2.deleteByPrestamo')
  handleDeleteFase2(
    @Payload() { prestamoId, user }: { prestamoId: string, user: Usuario }
  ) {
    return this.service.deleteByPrestamo(prestamoId, user);
  }
}
