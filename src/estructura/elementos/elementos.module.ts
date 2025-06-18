import { Module } from '@nestjs/common';
import { ElementosService } from './elementos.service';
import { ElementosResolver } from './elementos.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { ElementosHandler } from './elementos.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ElementosHandler],
  providers: [ElementosResolver, ElementosService],
})
export class ElementosModule {}
