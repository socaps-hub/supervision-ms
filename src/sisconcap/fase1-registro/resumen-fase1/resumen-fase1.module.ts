import { Module } from '@nestjs/common';
import { ResumenFase1Service } from './resumen-fase1.service';
import { ResumenFase1Resolver } from './resumen-fase1.resolver';

@Module({
  providers: [ResumenFase1Resolver, ResumenFase1Service],
})
export class ResumenFase1Module {}
