import { Args, Query, Resolver } from '@nestjs/graphql';
import { ReportesService } from './reportes.service';
import { UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';
import { Usuario } from 'src/common/entities/usuario.entity';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';
import { ReporteFase1Response } from './dto/fase1/reporte-segmentado-response.output';
import { ResumenAnomaliasSucAndEjecutivosCategoriaResponse, ResumenAnomaliasSucAndEjecutivosEjecutivoResponse, ResumenAnomaliasSucAndEjecutivosResponseDto } from './dto/fase1/resumen-anomalias-suc-with-ejecutivos-response.output';
import { ResumenAnomaliasArgs } from './dto/fase1/arg/resumen-anomalias.args';

@Resolver()
@UseGuards(AuthGraphQLGuard)
export class ReportesResolver {

  constructor(private readonly reportesService: ReportesService) { }

  @Query(() => ReporteFase1Response)
  async reporteSegmentadoFase1(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ReporteFase1Response> {
    return this.reportesService.getReporteSegmentadoF1(input, user);
  }

  @Query(() => ResumenAnomaliasSucAndEjecutivosResponseDto)
  async resumenAnomaliasSucAndEjecutivos(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ): Promise<ResumenAnomaliasSucAndEjecutivosResponseDto> {
    return this.reportesService.getResumenAnomaliasSucAndEjecutivos(input, user);
  }

  @Query(() => [ResumenAnomaliasSucAndEjecutivosEjecutivoResponse])
  async resumenAnomaliasEjecutivosPorSucursal(
    @Args() resumenAnomaliasArgs: ResumenAnomaliasArgs,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.reportesService.getResumenAnomaliasEjecutivosPorSucursal(resumenAnomaliasArgs, user);
  }

  @Query(() => ResumenAnomaliasSucAndEjecutivosCategoriaResponse)
  async resumenAnomaliasEjecutivosGlobal(
    @Args('input') input: FiltroFechasInput,
    @GetUserGraphQL() user: Usuario
  ) {
    return this.reportesService.getResumenAnomaliasEjecutivosGlobal(input, user);
  }

}
