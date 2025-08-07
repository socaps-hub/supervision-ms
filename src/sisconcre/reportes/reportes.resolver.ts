import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ReportesService } from './reportes.service';
import { FiltroFechasInput } from '../common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response } from './dto/fase1/reporte-segmentado-f1.output';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { DetalleAnomaliasF1Response } from './dto/fase1/detalle-anomalias-f1.output';
import { AnomaliasResumenResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1.output';

@Resolver()
@UseGuards( AuthGraphQLGuard )
export class ReportesResolver {

  constructor(private readonly reportesService: ReportesService) {}

  @Query(() => ReporteSegmentadoFase1Response)
  async reporteSegmentadoFase1(
    @Args('input') input: FiltroFechasInput,
  ): Promise<ReporteSegmentadoFase1Response> {
    return this.reportesService.getReporteSegmentadoF1(input);
  }

  @Query(() => DetalleAnomaliasF1Response)
  async detalleAnomaliasF1(
    @Args('input') input: FiltroFechasInput,
  ): Promise<DetalleAnomaliasF1Response> {
    return this.reportesService.getDetalleAnomaliasF1(input);
  }

  @Query(() => AnomaliasResumenResponseF1)
  async detalleAnomaliasIntegralF1(
    @Args('input') input: FiltroFechasInput,
  ): Promise<AnomaliasResumenResponseF1> {
    return this.reportesService.getDetalleAnomaliasIntegralProGruposF1(input);
  }

}
