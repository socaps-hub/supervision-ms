import { Resolver } from '@nestjs/graphql';
import { EvaluacionFase1Service } from './evaluacion-fase1.service';

@Resolver()
export class EvaluacionFase1Resolver {
  constructor(private readonly evaluacionFase1Service: EvaluacionFase1Service) {}
}
