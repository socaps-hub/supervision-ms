import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { ResumenFase3Service } from './resumen-fase3.service';
import { CreateEvaluacionResumenFase3Input } from './dtos/inputs/create-resumen-fase3.input';
import { UpdateEvaluacionResumenFase3Input } from './dtos/inputs/update-resumen-fase3.input';

@Controller()
export class ResumenFase3Handler {

  constructor(private readonly service: ResumenFase3Service) {}

  @MessagePattern('supervision.resumen-fase3.create')
  handleCreate(
    @Payload() data: { input: CreateEvaluacionResumenFase3Input; user: Usuario }
  ) {
    return this.service.create(data.input, data.user);
  }

  @MessagePattern('supervision.resumen-fase3.findAll')
  handleGetAll(@Payload() user: Usuario) {
    return this.service.findAll(user);
  }

  @MessagePattern('supervision.resumen-fase3.findOne')
  handleFindOne(
    @Payload() data: { R10P_num: string; user: Usuario }
  ) {
    return this.service.findOne(data.R10P_num, data.user);
  }

  @MessagePattern('supervision.resumen-fase3.update')
  handleUpdate(
    @Payload() data: { input: UpdateEvaluacionResumenFase3Input; user: Usuario }
  ) {
    return this.service.update(data.input.id, data.input, data.user);
  }

  @MessagePattern('supervision.resumen-fase3.deleteByPrestamo')
  handleDeleteResumenF3(
    @Payload() { prestamoId, user }: { prestamoId: string, user: Usuario }
  ) {
    return this.service.deleteByPrestamo(prestamoId, user);
  }
}
