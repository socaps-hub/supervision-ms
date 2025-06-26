import { Module } from '@nestjs/common';
import { ResumenFase1Service } from './resumen.service';
import { ResumenFase1Resolver } from './resumen.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ResumenFase1Handler } from './resumen-fase1.handler';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [ ResumenFase1Handler ],
  providers: [ResumenFase1Resolver, ResumenFase1Service],
})
export class ResumenModule {}
