import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CreditoService } from './credito.service';
import { AuthGraphQLGuard } from 'src/common/guards/auth-graphql.guard';
import { Usuario } from 'src/common/entities/usuario.entity';
import { ParametrosMuestraInput } from './dto/inputs/muestra-params.input';
import { ResultadoMuestraCreditoResponse } from './dto/outputs/resultado-muestra.output';
import { GetUserGraphQL } from 'src/common/decorators/user-graphql.decorator';

@Resolver()
@UseGuards(AuthGraphQLGuard)
export class CreditoResolver {
  constructor(private readonly creditoService: CreditoService) {}

  // ────────────────────────────────────────────────
  // 🔹 1️⃣ Endpoint principal: Cálculo inicial
  // (Se ejecuta solo al presionar "Calcular y Buscar")
  // ────────────────────────────────────────────────
  @Query(() => ResultadoMuestraCreditoResponse, {
    name: 'aCreditoGetMuestraInicial',
    description: 'Calcula la muestra global, universo y resumen de sucursales (valores absolutos)',
  })
  async getMuestraInicial(
    @Args('input') input: ParametrosMuestraInput,
    @GetUserGraphQL() usuario: Usuario,
  ): Promise<ResultadoMuestraCreditoResponse> {
    return this.creditoService.getMuestraInicial(input, usuario);
  }

  // ────────────────────────────────────────────────
  // 🔹 2️⃣ Endpoint secundario: Créditos filtrados
  // (Se ejecuta con lazy load, filtros o búsqueda)
  // ────────────────────────────────────────────────
  @Query(() => ResultadoMuestraCreditoResponse, {
    name: 'aCreditoGetCreditosFiltrados',
    description: 'Obtiene los créditos filtrados para la tabla sin recalcular valores globales',
  })
  async getCreditosFiltrados(
    @Args('input') input: ParametrosMuestraInput,
    @GetUserGraphQL() usuario: Usuario,
  ): Promise<Pick<ResultadoMuestraCreditoResponse, 'registrosMuestra' | 'page' | 'pageSize' | 'totalPages'>> {
    return this.creditoService.getCreditosFiltrados(input, usuario);
  }
}
