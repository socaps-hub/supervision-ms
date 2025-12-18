import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesResolver } from './reportes.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ReportesHandler } from './reportes.handler';

@Module({
  imports: [
    NatsModule
  ],
  providers: [ReportesResolver, ReportesService],
  controllers: [
    ReportesHandler,
  ],
})
export class ReportesModule {}
