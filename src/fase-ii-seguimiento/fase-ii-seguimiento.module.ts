import { Module } from '@nestjs/common';
import { EvaluacionesFase2Module } from './evaluaciones-fase2/evaluaciones-fase2.module';

@Module({
  imports: [EvaluacionesFase2Module]
})
export class FaseIiSeguimientoModule {}
