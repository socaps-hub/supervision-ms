import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesResolver } from './reportes.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ReportesHandler } from './reportes.handler';
import { ExcelModule } from 'src/common/excel/excel.module';
import { AwsModule } from 'src/common/aws/aws.module';

@Module({
  imports: [
    NatsModule,
    ExcelModule,
    AwsModule,
  ],
  providers: [ReportesResolver, ReportesService],
  controllers: [
    ReportesHandler,
  ],
})
export class ReportesModule {}
