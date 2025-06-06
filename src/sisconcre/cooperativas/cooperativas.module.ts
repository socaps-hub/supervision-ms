import { Module } from '@nestjs/common';
import { CooperativasService } from './cooperativas.service';
import { CooperativasResolver } from './cooperativas.resolver';

@Module({
  providers: [CooperativasResolver, CooperativasService],
  exports: [
    CooperativasService,
  ]
})
export class CooperativasModule {}
