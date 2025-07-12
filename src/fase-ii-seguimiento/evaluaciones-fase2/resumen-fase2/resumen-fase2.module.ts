import { Module } from '@nestjs/common';
import { ResumenFase2Resolver } from './resumen-fase2.resolver';
import { ResumenFase2Service } from './resumen-fase2.service';
import { NatsModule } from 'src/transports/nats.module';
import { ResumenFase2Handler } from './resumen-fase2.handler';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ ResumenFase2Handler ],
  providers: [ResumenFase2Resolver, ResumenFase2Service],
})
export class ResumenFase2Module {}
