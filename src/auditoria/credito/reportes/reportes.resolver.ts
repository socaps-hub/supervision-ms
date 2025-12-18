import { Resolver } from '@nestjs/graphql';
import { ReportesService } from './reportes.service';

@Resolver()
export class ReportesResolver {
  constructor(private readonly reportesService: ReportesService) {}
}
