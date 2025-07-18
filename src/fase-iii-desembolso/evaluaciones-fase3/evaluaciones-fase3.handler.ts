import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EvaluacionesFase3Service } from './evaluaciones-fase3.service';
import { Usuario } from 'src/common/entities/usuario.entity';
import { CreateEvaluacionFase3Input } from './dto/inputs/create-evaluacion-fase3.input';
import { UpdateEvaluacionFase3Input } from './dto/inputs/update-evaluacion-fase3.input';

@Controller()
export class EvaluacionesFase3Handler {

    constructor(private readonly service: EvaluacionesFase3Service) { }

    @MessagePattern('supervision.evaluacion-fase3.createMany')
    handleCreateMany(
        @Payload() data: { inputs: CreateEvaluacionFase3Input[]; user: Usuario }
    ) {
        return this.service.createMany(data.inputs, data.user);
    }

    @MessagePattern('supervision.evaluacion-fase3.findAll')
    handleFindAll(
        @Payload() data: { prestamoId: string; user: Usuario }
    ) {
        return this.service.findAll(data.prestamoId, data.user);
    }

    @MessagePattern('supervision.evaluacion-fase3.update')
    handleUpdate(
        @Payload() data: { input: UpdateEvaluacionFase3Input; user: Usuario }
    ) {
        return this.service.update(data.input.id, data.input, data.user);
    }

    @MessagePattern('supervision.evaluacion-fase3.deleteByPrestamo')
    handleDeleteByPrestamo(
        @Payload() data: { prestamoId: string; user: Usuario }
    ) {
        return this.service.deleteByPrestamo(data.prestamoId, data.user);
    }
}
