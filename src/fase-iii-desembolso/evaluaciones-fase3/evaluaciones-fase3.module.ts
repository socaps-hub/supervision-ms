import { Module } from '@nestjs/common';
import { EvaluacionesFase3Service } from './evaluaciones-fase3.service';
import { EvaluacionesFase3Resolver } from './evaluaciones-fase3.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { EvaluacionesFase3Handler } from './evaluaciones-fase3.handler';
import { ResumenFase3Module } from './resumen-fase3/resumen-fase3.module';

@Module({
  imports: [
    NatsModule,
    ResumenFase3Module
  ],
  controllers: [ EvaluacionesFase3Handler ],
  providers: [EvaluacionesFase3Resolver, EvaluacionesFase3Service],
})
export class EvaluacionesFase3Module {}
