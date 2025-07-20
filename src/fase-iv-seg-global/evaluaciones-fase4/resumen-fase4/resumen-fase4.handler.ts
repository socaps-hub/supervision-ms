import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { Usuario } from 'src/common/entities/usuario.entity';
import { ResumenFase4Service } from './resumen-fase4.service';
import { CreateEvaluacionResumenFase4Input } from './dto/inputs/create-evaluacion-resumen-fase4.input';
import { UpdateEvaluacionResumenFase4Input } from './dto/inputs/update-evaluacion-resumen-fase4.input';

@Controller()
export class ResumenFase4Handler {

    constructor(private readonly service: ResumenFase4Service) { }

    @MessagePattern('supervision.resumen-fase4.create')
    handleCreate(
        @Payload() data: { input: CreateEvaluacionResumenFase4Input; user: Usuario }
    ) {
        return this.service.create(data.input, data.user);
    }

    @MessagePattern('supervision.resumen-fase4.findAll')
    handleGetAll(@Payload() user: Usuario) {
        return this.service.findAll(user);
    }

    @MessagePattern('supervision.resumen-fase4.findOne')
    handleFindOne(
        @Payload() data: { R16P_num: string; user: Usuario }
    ) {
        return this.service.findOne(data.R16P_num, data.user);
    }

    @MessagePattern('supervision.resumen-fase4.update')
    handleUpdate(
        @Payload() data: { input: UpdateEvaluacionResumenFase4Input; user: Usuario }
    ) {
        return this.service.update(data.input.id, data.input, data.user);
    }

    @MessagePattern('supervision.resumen-fase4.deleteByPrestamo')
    handleDeleteResumenF4(
        @Payload() { prestamoId, user }: { prestamoId: string; user: Usuario }
    ) {
        return this.service.deleteByPrestamo(prestamoId, user);
    }
}
