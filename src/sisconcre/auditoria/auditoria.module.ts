import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaResolver } from './auditoria.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { AuditoriaHandler } from './auditoria.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ AuditoriaHandler ],
  providers: [AuditoriaResolver, AuditoriaService],
})
export class AuditoriaModule {}
