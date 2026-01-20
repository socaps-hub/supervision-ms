import { Resolver } from '@nestjs/graphql';
import { SolicitudesService } from './solicitudes.service';

@Resolver()
export class SolicitudesResolver {
  constructor(private readonly solicitudesService: SolicitudesService) {}
}
