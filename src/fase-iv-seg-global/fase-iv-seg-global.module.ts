import { Module } from '@nestjs/common';
import { EvaluacionesFase4Module } from './evaluaciones-fase4/evaluaciones-fase4.module';

@Module({
  imports: [EvaluacionesFase4Module]
})
export class FaseIvSegGlobalModule {}
