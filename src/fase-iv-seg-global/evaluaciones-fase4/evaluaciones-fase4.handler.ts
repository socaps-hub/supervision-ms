import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EvaluacionesFase4Service } from './evaluaciones-fase4.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase4Input } from './dto/inputs/create-evaluacion-fase4.input';
import { UpdateEvaluacionFase4Input } from './dto/inputs/update-evaluacion-fase4.input';

@Controller()
export class EvaluacionesFase4Handler {

    constructor(private readonly service: EvaluacionesFase4Service) { }

    @MessagePattern('supervision.evaluacion-fase4.createMany')
    handleCreateMany(
        @Payload() data: { inputs: CreateEvaluacionFase4Input[]; user: Usuario }
    ) {
        return this.service.createMany(data.inputs, data.user);
    }

    @MessagePattern('supervision.evaluacion-fase4.findAll')
    handleFindAll(
        @Payload() data: { prestamoId: string; user: Usuario }
    ) {
        return this.service.findAll(data.prestamoId, data.user);
    }

    @MessagePattern('supervision.evaluacion-fase4.update')
    handleUpdate(
        @Payload() data: { input: UpdateEvaluacionFase4Input }
    ) {
        return this.service.update(data.input.id, data.input);
    }

    @MessagePattern('supervision.evaluacion-fase4.deleteByPrestamo')
    handleDeleteByPrestamo(
        @Payload() { prestamoId, user }: { prestamoId: string; user: Usuario }
    ) {
        return this.service.deleteByPrestamo(prestamoId, user);
    }
}
