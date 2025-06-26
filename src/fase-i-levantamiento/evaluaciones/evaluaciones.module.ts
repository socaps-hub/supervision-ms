import { Module } from '@nestjs/common';
import { EvaluacionesFase1Resolver } from './evaluaciones-fase1.resolver';
import { EvaluacionesFase1Service } from './evaluaciones-fase1.service';
import { NatsModule } from 'src/transports/nats.module';
import { EvaluacionesFase1Handler } from './evaluaciones-fase1.handler';
import { ResumenModule } from './resumen/resumen.module';

@Module({
  imports: [
    NatsModule,
    ResumenModule,
  ],
  controllers: [
    EvaluacionesFase1Handler,
  ],
  providers: [EvaluacionesFase1Resolver, EvaluacionesFase1Service],
})
export class EvaluacionesModule {}
