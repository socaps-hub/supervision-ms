import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposResolver } from './grupos.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { GruposHandler } from './grupos.handler';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ GruposHandler ],
  providers: [GruposResolver, GruposService],
})
export class GruposModule {}
