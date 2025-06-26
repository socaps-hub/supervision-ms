import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateResumenFase1Input } from './dto/create-resumen-fase1.input';
import { UpdateResumenFase1Input } from './dto/update-resumen-fase1.input';
import { Usuario } from 'src/common/entities/usuario.entity';
import { ResumenFase1Service } from './resumen.service';

@Controller()
export class ResumenFase1Handler {
  constructor(private readonly resumenService: ResumenFase1Service) {}

  @MessagePattern('supervision.resumen-fase1.create')
  handleCreate(
    @Payload() data: { input: CreateResumenFase1Input; user: Usuario }
  ) {
    return this.resumenService.create(data.input, data.user);
  }

  @MessagePattern('supervision.resumen-fase1.getAll')
  handleFindAll(
    @Payload('user') user: Usuario
  ) {
    return this.resumenService.findAll(user);
  }

  @MessagePattern('supervision.resumen-fase1.getById')
  handleFindOne(
    @Payload() data: { R06P_num: string; user: Usuario }
  ) {
    return this.resumenService.findOne(data.R06P_num, data.user);
  }

  @MessagePattern('supervision.resumen-fase1.update')
  handleUpdate(
    @Payload() data: { input: UpdateResumenFase1Input; user: Usuario }
  ) {
    return this.resumenService.update(data.input.id, data.input, data.user);
  }
}
