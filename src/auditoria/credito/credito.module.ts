import { Module } from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreditoResolver } from './credito.resolver';
import { NatsModule } from 'src/transports/nats.module';
import { CreditoHandler } from './credito.handler';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [ CreditoHandler ],
  providers: [CreditoResolver, CreditoService],
})
export class CreditoModule {}
