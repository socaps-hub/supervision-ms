import { Module } from '@nestjs/common';
import { Fase1RevisionService } from './fase1-revision.service';
import { Fase1RevisionResolver } from './fase1-revision.resolver';
import { Fase1RevisionHandler } from './fase1-revision.handler';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    NatsModule,
  ],
  providers: [Fase1RevisionResolver, Fase1RevisionService],
  controllers: [ Fase1RevisionHandler ],
})
export class Fase1RevisionModule {}
