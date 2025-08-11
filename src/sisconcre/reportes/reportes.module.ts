import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesResolver } from './reportes.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ReporteFase1Service } from './fase1/fase1.service';
import { ReportesHandler } from './reportes.handler';
import { ReporteFase2Service } from './fase2/fase2.service';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ ReportesHandler ],
  providers: [
    ReportesResolver, 
    ReportesService, 
    ReporteFase1Service,
    ReporteFase2Service,
  ],
})
export class ReportesModule {}
