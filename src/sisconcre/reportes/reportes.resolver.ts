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
import { ReporteFase3Response } from './dto/fase3/revision-desembolsos.dto';
import { DetalleAnomaliasF3Response } from './dto/fase3/anomalias-desembolso.dto';
import { ReporteFase4Response } from './dto/fase4/reporte-global.dto';

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

  // * REPORTES FASE 3
  @Query(() => ReporteFase3Response)
  async revisionDesembolsosF3(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ReporteFase3Response> {
    return this.reportesService.getRevisionDesembolsosF3(input, user);
  }

  @Query(() => DetalleAnomaliasF3Response)
  async detalleAnomaliasF3(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<DetalleAnomaliasF3Response> {
    return this.reportesService.getDetalleAnomaliasF3(input, user);
  }

  // * REPORTES FASE 4
  @Query(() => ReporteFase4Response)
  async reporteGlobalF4(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ReporteFase4Response> {
    return this.reportesService.getReporteGlobalF4(input, user);
  }

}
