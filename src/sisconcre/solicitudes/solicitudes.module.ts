import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesResolver } from './solicitudes.resolver';
import { SolicitudesHandler } from './solicitudes.handler';

@Module({
  controllers: [
    SolicitudesHandler,
  ],
  providers: [SolicitudesResolver, SolicitudesService],
})
export class SolicitudesModule {}
