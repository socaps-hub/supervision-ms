import { Resolver } from '@nestjs/graphql';
import { Fase2SeguimientoService } from './fase2-seguimiento.service';

@Resolver()
export class Fase2SeguimientoResolver {
  constructor(private readonly fase2SeguimientoService: Fase2SeguimientoService) {}
}
