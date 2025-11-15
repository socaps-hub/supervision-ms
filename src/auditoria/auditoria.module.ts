import { Module } from '@nestjs/common';
import { CreditoModule } from './credito/credito.module';
import { Fase1RevisionModule } from './fase1-revision/fase1-revision.module';

@Module({
  imports: [CreditoModule, Fase1RevisionModule]
})
export class AuditoriaModule {}
