import { Module } from '@nestjs/common';
import { EvaluacionFase1Service } from './evaluacion-fase1.service';
import { EvaluacionFase1Resolver } from './evaluacion-fase1.resolver';

@Module({
  providers: [EvaluacionFase1Resolver, EvaluacionFase1Service],
})
export class EvaluacionFase1Module {}
