import { Module } from '@nestjs/common';
import { EvaluacionesFase2Service } from './evaluaciones-fase2.service';
import { EvaluacionesFase2Resolver } from './evaluaciones-fase2.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { EvaluacionesFase2Handler } from './evaluaciones-fase2.handler';
import { ResumenFase2Module } from './resumen-fase2/resumen-fase2.module';

@Module({
  imports: [
    NatsModule,
    ResumenFase2Module,
  ],
  controllers: [ EvaluacionesFase2Handler ],
  providers: [EvaluacionesFase2Resolver, EvaluacionesFase2Service],
})
export class EvaluacionesFase2Module {}
