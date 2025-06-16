import { Module } from '@nestjs/common';
import { LimitePrudencialService } from './limite-prudencial.service';
import { LimitePrudencialResolver } from './limite-prudencial.resolver';
import { LimitePrudencialHandler } from './limite-prudencial.handler';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule,
  ],
  controllers: [
    LimitePrudencialHandler
  ],
  providers: [
    LimitePrudencialResolver, 
    LimitePrudencialService,
  ],
})
export class LimitePrudencialModule {}
