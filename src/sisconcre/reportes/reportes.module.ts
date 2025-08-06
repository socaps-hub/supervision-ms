import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesResolver } from './reportes.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ReporteFase1Service } from './fase1/fase1.service';
import { ReportesHandler } from './reportes.handler';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ ReportesHandler ],
  providers: [
    ReportesResolver, 
    ReportesService, 
    ReporteFase1Service,
  ],
})
export class ReportesModule {}
