import { Resolver } from '@nestjs/graphql';
import { ResumenFase1Service } from './resumen-fase1.service';

@Resolver()
export class ResumenFase1Resolver {
  constructor(private readonly resumenFase1Service: ResumenFase1Service) {}
}
