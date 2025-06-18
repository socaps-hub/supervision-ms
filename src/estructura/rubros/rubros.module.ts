import { Module } from '@nestjs/common';
import { RubrosService } from './rubros.service';
import { RubrosResolver } from './rubros.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { RubrosHandler } from './rubros.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ RubrosHandler ],
  providers: [RubrosResolver, RubrosService],
})
export class RubrosModule {}
