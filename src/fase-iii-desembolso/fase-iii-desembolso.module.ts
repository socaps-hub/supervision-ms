import { Module } from '@nestjs/common';
import { EvaluacionesFase3Module } from './evaluaciones-fase3/evaluaciones-fase3.module';

@Module({
  imports: [EvaluacionesFase3Module]
})
export class FaseIiiDesembolsoModule {}
