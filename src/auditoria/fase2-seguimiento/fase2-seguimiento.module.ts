import { Module } from '@nestjs/common';
import { Fase2SeguimientoService } from './fase2-seguimiento.service';
import { Fase2SeguimientoResolver } from './fase2-seguimiento.resolver';
import { Fase2SeguimientoHandler } from './fase2-seguimiento.handler';

@Module({
  providers: [Fase2SeguimientoResolver, Fase2SeguimientoService],
  controllers: [ Fase2SeguimientoHandler ],
})
export class Fase2SeguimientoModule {}
