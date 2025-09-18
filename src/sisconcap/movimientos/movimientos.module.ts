import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosResolver } from './movimientos.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { MovimientosHandler } from './movimientos.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ MovimientosHandler ],
  providers: [MovimientosResolver, MovimientosService],
})
export class MovimientosModule {}
