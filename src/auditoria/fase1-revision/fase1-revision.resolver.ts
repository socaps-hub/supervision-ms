import { Resolver } from '@nestjs/graphql';
import { Fase1RevisionService } from './fase1-revision.service';

@Resolver()
export class Fase1RevisionResolver {
  constructor(private readonly fase1RevisionService: Fase1RevisionService) {}
}
