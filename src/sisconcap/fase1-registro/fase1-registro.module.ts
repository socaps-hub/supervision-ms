import { Module } from '@nestjs/common';
import { EvaluacionFase1Module } from './evaluacion-fase1/evaluacion-fase1.module';
import { ResumenFase1Module } from './resumen-fase1/resumen-fase1.module';

@Module({
  imports: [EvaluacionFase1Module, ResumenFase1Module]
})
export class Fase1RegistroModule {}
