import { Module } from '@nestjs/common';
import { EvaluacionesFase4Service } from './evaluaciones-fase4.service';
import { EvaluacionesFase4Resolver } from './evaluaciones-fase4.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { EvaluacionesFase4Handler } from './evaluaciones-fase4.handler';
import { ResumenFase4Module } from './resumen-fase4/resumen-fase4.module';

@Module({
  imports: [ 
    NatsModule, ResumenFase4Module,
  ],
  controllers: [ EvaluacionesFase4Handler ],
  providers: [EvaluacionesFase4Resolver, EvaluacionesFase4Service],
})
export class EvaluacionesFase4Module {}
