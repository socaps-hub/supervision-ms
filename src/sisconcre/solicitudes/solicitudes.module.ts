import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesResolver } from './solicitudes.resolver';
import { SolicitudesHandler } from './solicitudes.handler';
import { ActivityLogRpcInterceptor } from 'src/common/interceptor/activity-log-rpc.interceptor';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [
    SolicitudesHandler,
  ],
  providers: [
    SolicitudesResolver, 
    SolicitudesService,
    ActivityLogRpcInterceptor,
  ],
})
export class SolicitudesModule {}
