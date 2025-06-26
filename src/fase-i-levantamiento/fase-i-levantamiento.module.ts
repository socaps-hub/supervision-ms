import { Module } from '@nestjs/common';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';

@Module({
  imports: [SolicitudesModule, EvaluacionesModule]
})
export class FaseILevantamientoModule {}
