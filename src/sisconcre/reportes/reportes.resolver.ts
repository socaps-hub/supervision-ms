import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ReportesService } from './reportes.service';
import { FiltroFechasInput } from '../common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response } from './dto/fase1/reporte-segmentado-f1.output';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { DetalleAnomaliasF1Response } from './dto/fase1/detalle-anomalias-f1.output';
import { AnomaliasResumenResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1.output';
import { DetalleAnomaliasEjecutivoF1Response } from './dto/fase1/detalle-anomalias-f1-ejecutivo.output';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { Usuario } from 'src/common/entities/usuario.entity';
import { DetalleAnomaliasIntegralEjecutivosResponseF1 } from './dto/fase1/detalle-anomalias-integral-f1-ejecutivos.output';
import { ReporteFase2Response } from './dto/fase2/resultados-seguimiento.dto';

@Resolver()
@UseGuards( AuthGraphQLGuard )
export class ReportesResolver {

  constructor(private readonly reportesService: ReportesService) {}

  @Query(() => ReporteSegmentadoFase1Response)
  async reporteSegmentadoFase1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ReporteSegmentadoFase1Response> {
    return this.reportesService.getReporteSegmentadoF1(input, user);
  }

  @Query(() => DetalleAnomaliasF1Response)
  async detalleAnomaliasF1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<DetalleAnomaliasF1Response> {
    return this.reportesService.getDetalleAnomaliasF1(input, user);
  }

  @Query(() => AnomaliasResumenResponseF1)
  async detalleAnomaliasIntegralF1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<AnomaliasResumenResponseF1> {
    return this.reportesService.getDetalleAnomaliasIntegralProGruposF1(input, user);
  }

  @Query(() => DetalleAnomaliasEjecutivoF1Response)
  async detalleAnomaliaPorEjecutivoF1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<DetalleAnomaliasEjecutivoF1Response> {
    return this.reportesService.getDetalleAnomaliasPorEjecutivoF1(input, user);
  }

  @Query(() => DetalleAnomaliasIntegralEjecutivosResponseF1)
  async detalleAnomaliasIntegralPorEjecutivoF1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<DetalleAnomaliasIntegralEjecutivosResponseF1> {
    return this.reportesService.getDetalleAnomaliasIntegralPorEjecutivoF1(input, user);
  }

  // * REPORTES FASE 2
  @Query(() => ReporteFase2Response)
  async resultadoSeguimientoF2(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ReporteFase2Response> {
    return this.reportesService.getResultadosSeguimientoF2(input, user);
  }

}
