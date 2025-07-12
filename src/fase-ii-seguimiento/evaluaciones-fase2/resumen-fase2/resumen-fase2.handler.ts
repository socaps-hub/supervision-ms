import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ResumenFase2Service } from './resumen-fase2.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionResumenFase2Input } from './dto/inputs/create-evaluacion-resumen-fase2.input';
import { UpdateEvaluacionResumenFase2Input } from './dto/inputs/update-evaluacion-resumen-fase2.input';

@Controller()
export class ResumenFase2Handler {
  constructor(private readonly resumenFase2Service: ResumenFase2Service) {}

  @MessagePattern('supervision.resumen-fase2.create')
  handleCreate(
    @Payload() data: { input: CreateEvaluacionResumenFase2Input; user: Usuario }
  ) {
    return this.resumenFase2Service.create(data.input, data.user);
  }

  @MessagePattern('supervision.resumen-fase2.findAll')
  handleGetAll(@Payload() user: Usuario) {
    return this.resumenFase2Service.findAll(user);
  }

  @MessagePattern('supervision.resumen-fase2.findOne')
  handleFindOne(
    @Payload() data: { R08P_num: string; user: Usuario }
  ) {
    return this.resumenFase2Service.findOne(data.R08P_num, data.user);
  }

  @MessagePattern('supervision.resumen-fase2.update')
  handleUpdate(
    @Payload() data: {
      input: UpdateEvaluacionResumenFase2Input;
      user: Usuario;
    }
  ) {
    return this.resumenFase2Service.update(data.input.id, data.input, data.user);
  }

  @MessagePattern('supervision.resumen-fase2.deleteByPrestamo')
  handleDeleteResumenF2(
    @Payload() { prestamoId, user }: { prestamoId: string, user: Usuario }
  ) {
    return this.resumenFase2Service.deleteByPrestamo(prestamoId, user);
  }
}
