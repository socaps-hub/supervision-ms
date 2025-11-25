import { Module } from '@nestjs/common';
import { CreditoModule } from './credito/credito.module';
import { Fase1RevisionModule } from './fase1-revision/fase1-revision.module';
import { Fase2SeguimientoModule } from './fase2-seguimiento/fase2-seguimiento.module';

@Module({
  imports: [CreditoModule, Fase1RevisionModule, Fase2SeguimientoModule]
})
export class AuditoriaModule {}
