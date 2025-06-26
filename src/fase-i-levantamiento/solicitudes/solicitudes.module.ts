import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesResolver } from './solicitudes.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { SolicitudesHandler } from './solicitudes.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ SolicitudesHandler ],
  providers: [SolicitudesResolver, SolicitudesService],
})
export class SolicitudesModule {}
