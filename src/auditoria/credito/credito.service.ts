import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaClient } from '@prisma/client';

import { Usuario } from 'src/common/entities/usuario.entity';
import { ResultadoMuestraCreditoResponse, ResultadoMuestraSucursalResumen } from './dto/outputs/resultado-muestra.output';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';
import { CreateMuestraSeleccionInput } from './dto/inputs/muestra-seleccion/create-muestra-seleccion.input';
import { BooleanResponse } from 'src/common/dto/boolean-response.object';
import { ResultadoMuestrasResponse } from './dto/outputs/muestra-seleccion/resultado-muestras.output';
import { GetCreditosSeleccionadosInput } from './dto/inputs/muestra-credito-seleccion/get-creditos-seleccionados.input';
import { ResultadoCreditosSeleccionadosResponse } from './dto/outputs/muestra-credito-seleccion/resultado-creditos-seleccionados.output';
import { ParametrosMuestraExtendInput } from './dto/inputs/muestra-params-extend.input';
import { MuestraCreditoSeleccion } from './entities/muestra-credito-seleccion.entity';

@Injectable()
export class CreditoService extends PrismaClient implements OnModuleInit {
    private readonly _logger = new Logger('CreditoService');

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected');
    }

    // ════════════════════════════════════════════════
    // 🔷 MÉTODOS PÚBLICOS
    // ════════════════════════════════════════════════

    // TODO - gateway -> entities -> dtos -> services -> resolvers
    public async getCreditoSeleccionadoById( id: number ): Promise<MuestraCreditoSeleccion> {
        const credito = await this.a02MuestraCreditoSeleccion.findFirst({
            where: {
                A02Id: id
            },
            include: {
                evaluacionRevisionF1: true,
                resumenRevisionF1: {
                    include: {
                       auditor: true,
                       responsable: true, 
                    }
                },
            }
        })

        if (!credito) {
            throw new RpcException({
                message: `Crédito seleccionado con id ${ id } no fue encontrado`,
                status: HttpStatus.NOT_FOUND
          })
        }

        // Normalizar null -> undefined para los campos que tu DTO/entidad espera opcionales
        return {
            ...credito,
            A02CAG: credito.A02CAG ?? undefined,
            A02Nombre: credito.A02Nombre ?? undefined,
            A02Relacion: credito.A02Relacion ?? undefined,
            A02Prestamo: credito.A02Prestamo ?? undefined,
            A02Clasificacion: credito.A02Clasificacion ?? undefined,
            A02Producto: credito.A02Producto ?? undefined,
            A02Finalidad: credito.A02Finalidad ?? undefined,
            A02DestinoAgro: credito.A02DestinoAgro ?? undefined,
            A02TipoPago: credito.A02TipoPago ?? undefined,
            A02FechaOtorgamiento: credito.A02FechaOtorgamiento ?? undefined,
            A02FechaVencimiento: credito.A02FechaVencimiento ?? undefined,
            A02FechaConsultaBuro: credito.A02FechaConsultaBuro ?? undefined,
            A02PlazoDias: credito.A02PlazoDias ?? undefined,
            A02TasaInteresNormal: credito.A02TasaInteresNormal ?? undefined,
            A02CantidadEntregada: credito.A02CantidadEntregada ?? undefined,
            A02DeudaTotal: credito.A02DeudaTotal ?? undefined,
            A02GarantiaLiquida: credito.A02GarantiaLiquida ?? undefined,
            A02GarantiaPrendaria: credito.A02GarantiaPrendaria ?? undefined,
            A02GarantiaHipotecaria: credito.A02GarantiaHipotecaria ?? undefined,
            A02TipoAutorizacion: credito.A02TipoAutorizacion ?? undefined,
            A02UsrAutorizacionNi: credito.A02UsrAutorizacionNi ?? undefined,
            A02UsrAutorizacionNombre: credito.A02UsrAutorizacionNombre ?? undefined,
            A02TipoCredito: credito.A02TipoCredito ?? undefined,
            evaluacionRevisionF1: credito.evaluacionRevisionF1 ?? undefined,
            resumenRevisionF1: credito.resumenRevisionF1 ?? undefined,
        };
    }

    // ────────────────────────────────────────────────
    // 🔹 1. Cálculo inicial (universo + muestra + resumen)
    // ────────────────────────────────────────────────
    async getMuestraInicial(
        input: ParametrosMuestraExtendInput,
        usuario: Usuario,
    ): Promise<ResultadoMuestraCreditoResponse> {
        const { filtro, margenError, nivelConfianza } = input;

        // 1️⃣ Último control de carga
        const lastControl = await this._getLastControlCarga(usuario);

        // 2️⃣ Calcular universo y muestra
        const { tamanoUniverso, tamanoMuestra } = await this._calcularUniversoYMuestra(
            usuario,
            filtro,
            margenError,
            nivelConfianza,
            lastControl.C01Id,
        );

        // 3️⃣ Generar muestra global
        const muestraGlobal = await this._generarMuestraGlobal(
            usuario,
            filtro,
            tamanoUniverso,
            tamanoMuestra,
            lastControl.C01Id,
        );

        // 4️⃣ Calcular resumen global
        const resumenSucursales = await this._calcularResumenGlobal(
            usuario,
            filtro,
            tamanoUniverso,
            muestraGlobal,
            lastControl.C01Id,
        );

        // 5️⃣ Retornar datos iniciales
        return {
            tamanoUniverso,
            tamanoMuestra,
            resumenSucursales,
            registrosMuestra: [],
            page: 1,
            pageSize: 50,
            totalPages: 1,
        };
    }

    // ────────────────────────────────────────────────
    // 🔹 2. Obtener créditos filtrados (lazy load / scroll)
    // ────────────────────────────────────────────────
    async getCreditosFiltrados(
        input: ParametrosMuestraExtendInput,
        usuario: Usuario,
    ): Promise<
        Pick<ResultadoMuestraCreditoResponse, 'registrosMuestra' | 'page' | 'pageSize' | 'totalPages'>
    > {
        const {
            filtro,
            page = 1,
            pageSize = 50,
            paginado = true,
            searchText,
            filters,
            muestraId,
            first = 0,
        } = input;

        // 1️⃣ Último control de carga
        const lastControl = await this._getLastControlCarga(usuario);

        // 2️⃣ Folios seleccionados (modo edición)
        let foliosSeleccionados: number[] = [];
        if (muestraId) {
            const detalle = await this.a02MuestraCreditoSeleccion.findMany({
                where: { A02MuestraId: muestraId },
                select: { A02CreditoFolio: true },
            });
            foliosSeleccionados = detalle.map((d) => d.A02CreditoFolio);
        }

        // 3️⃣ Obtener registros filtrados
        const { registrosFiltrados, totalFiltrados } = await this._obtenerRegistrosFiltrados(
            usuario,
            filtro,
            filters,
            searchText,
            paginado,
            first,
            pageSize,
            lastControl.C01Id,
            foliosSeleccionados,
        );

        // 4️⃣ Resolver nombres de sucursal
        const registrosMuestra = await this._resolverNombresSucursales(usuario, registrosFiltrados);

        // 5️⃣ Calcular páginas
        const totalPages = paginado ? Math.ceil(totalFiltrados / pageSize) : 1;

        return { registrosMuestra, page, pageSize, totalPages };
    }

    // ════════════════════════════════════════════════
    // 🔷 MÉTODOS PRIVADOS PRINCIPALES
    // ════════════════════════════════════════════════

    // ────────────────────────────────────────────────
    // 🔸 [1] Calcular universo y tamaño de muestra
    // ────────────────────────────────────────────────
    private async _calcularUniversoYMuestra(
        usuario: Usuario,
        filtro: FiltroFechasInput,
        margenError: number,
        nivelConfianza: number,
        controlId: number,
    ) {
        const { fechaInicio, fechaFinal } = filtro;

        const globalWhere = {
            RA01FEntrega: { gte: fechaInicio, lte: fechaFinal },
            RA01ControlId: controlId,
            control: { C01CooperativaCodigo: usuario.R12Coop_id },
        };

        const tamanoUniverso = await this.rA01Credito.count({ where: globalWhere });

        let tamanoMuestra = 0;
        if (tamanoUniverso > 0) {
            const Z = this._getZScore(nivelConfianza);
            const p = 0.5;
            const E = margenError / 100;
            tamanoMuestra = Math.round(
                (Math.pow(Z, 2) * p * (1 - p) * tamanoUniverso) /
                (Math.pow(E, 2) * (tamanoUniverso - 1) + Math.pow(Z, 2) * p * (1 - p)),
            );
        }

        return { tamanoUniverso, tamanoMuestra };
    }

    // ────────────────────────────────────────────────
    // 🔸 [2] Obtener registros filtrados (modo normal / edición)
    // ────────────────────────────────────────────────
    private async _obtenerRegistrosFiltrados(
        usuario: Usuario,
        filtro: FiltroFechasInput,
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
        paginado: boolean,
        offset: number,
        pageSize: number,
        controlId: number,
        foliosSeleccionados: number[] = [],
    ) {
        const { fechaInicio, fechaFinal } = filtro;

        const baseWhere = await this._buildFilterWhere(
            filters,
            searchText,
            usuario,
            fechaInicio,
            fechaFinal,
            controlId,
        );

        const ORDER = { RA01Folio: 'asc' as const };
        const skip = Math.max(0, offset);
        const take = pageSize;

        let registrosFiltrados: any[] = [];
        let totalFiltrados = await this.rA01Credito.count({ where: baseWhere });

        // 🧩 MODO EDICIÓN
        if (foliosSeleccionados.length > 0) {
            // 🔹 Determinar el rango de folios seleccionados visibles en este chunk
            //    (para no traer miles de registros de golpe)
            const seleccionadosEnRango = await this.rA01Credito.findMany({
                where: {
                    ...baseWhere,
                    RA01Folio: { in: foliosSeleccionados },
                },
                select: this._selectBasico(),
                orderBy: ORDER,
                skip,
                take, // 🔸 paginamos también los seleccionados
            });

            // 🔹 Si no llenan el chunk, completar con no seleccionados
            const faltan = Math.max(0, take - seleccionadosEnRango.length);
            const noSeleccionados = await this.rA01Credito.findMany({
                where: {
                    ...baseWhere,
                    RA01Folio: { notIn: foliosSeleccionados },
                },
                select: this._selectBasico(),
                orderBy: ORDER,
                skip,
                take: faltan, // sólo para completar el bloque
            });

            registrosFiltrados = [...seleccionadosEnRango, ...noSeleccionados];

            // 🔹 Total global = seleccionados + no seleccionados
            totalFiltrados =
                foliosSeleccionados.length +
                (await this.rA01Credito.count({
                    where: { ...baseWhere, RA01Folio: { notIn: foliosSeleccionados } },
                }));
        }

        // 🧩 MODO NORMAL
        else {
            registrosFiltrados = await this.rA01Credito.findMany({
                where: baseWhere,
                select: this._selectBasico(),
                orderBy: ORDER,
                skip,
                take,
            });
        }

        return { registrosFiltrados, totalFiltrados };
    }


    // ────────────────────────────────────────────────
    // 🔸 [3] Resolver nombres de sucursal
    // ────────────────────────────────────────────────
    private async _resolverNombresSucursales(usuario: Usuario, registros: any[]): Promise<any[]> {
        const sucursales = await this.r11Sucursal.findMany({
            where: { R11Coop_id: usuario.R12Coop_id },
            select: { R11NumSuc: true, R11Nom: true },
        });

        const sucursalMap = new Map(sucursales.map((s) => [s.R11NumSuc, s.R11Nom]));

        return registros.map((r) => ({
            ...r,
            RA01Sucursal: sucursalMap.get(r.RA01Sucursal) ?? 'No identificada',
        }));
    }

    // ────────────────────────────────────────────────
    // 🔸 [4] Calcular resumen global
    // ────────────────────────────────────────────────
    private async _calcularResumenGlobal(
        usuario: Usuario,
        filtro: FiltroFechasInput,
        totalUniverso: number,
        muestra: any[],
        controlId: number,
    ): Promise<ResultadoMuestraSucursalResumen[]> {
        const { fechaInicio, fechaFinal } = filtro;

        const agrupados = await this.rA01Credito.groupBy({
            by: ['RA01Sucursal', 'RA01Tipo'],
            where: {
                RA01FEntrega: { gte: fechaInicio, lte: fechaFinal },
                RA01ControlId: controlId,
            },
            _count: { _all: true },
        });

        const sucursales = await this.r11Sucursal.findMany({
            where: { R11Coop_id: usuario.R12Coop_id },
            select: { R11NumSuc: true, R11Nom: true },
        });

        const sucursalMap = new Map(sucursales.map((s) => [s.R11NumSuc, s.R11Nom]));
        const resumenPorSucursal = new Map<string, any>();

        for (const a of agrupados) {
            const sucursal = sucursalMap.get(a.RA01Sucursal) ?? 'No identificada';
            const tipo = (a.RA01Tipo || '').toUpperCase();

            if (!resumenPorSucursal.has(sucursal)) {
                resumenPorSucursal.set(sucursal, {
                    sucursal,
                    creditosOtorgados: 0,
                    categorias: { COMERCIAL: 0, CONSUMO: 0, VIVIENDA: 0 },
                });
            }

            const entry = resumenPorSucursal.get(sucursal);
            entry.creditosOtorgados += a._count._all;
            if (entry.categorias[tipo] !== undefined) {
                entry.categorias[tipo] += a._count._all;
            }
        }

        const resumenArray: ResultadoMuestraSucursalResumen[] = [];

        for (const [sucursal, data] of resumenPorSucursal) {
            const porcentajeUniverso = (data.creditosOtorgados / totalUniverso) * 100;

            const muestraSuc = muestra.filter(
                (r) => (r.RA01Sucursal || '').toLowerCase() === sucursal.toLowerCase(),
            );

            const categorias = Object.entries(data.categorias).map(([cat, cantidad]) => {
                const cantidadNum = cantidad as number;
                const porcentajeCat =
                    cantidadNum > 0 ? (cantidadNum / data.creditosOtorgados) * 100 : 0;

                const numeroExpedientes = muestraSuc.filter((m) => {
                    const tipo = (m.RA01Tipo || '').toUpperCase();
                    return tipo === cat.toUpperCase();
                }).length;

                return {
                    categoria: cat.charAt(0) + cat.slice(1).toLowerCase(),
                    cantidad: cantidadNum,
                    porcentajeUniverso: +porcentajeCat.toFixed(2),
                    numeroExpedientes,
                };
            });

            resumenArray.push({
                sucursal,
                creditosOtorgados: data.creditosOtorgados,
                porcentajeUniverso: +porcentajeUniverso.toFixed(2),
                numeroExpedientes: muestraSuc.length,
                categorias,
            });
        }

        return resumenArray.sort((a, b) => b.creditosOtorgados - a.creditosOtorgados);
    }

    // ════════════════════════════════════════════════
    // 🔷 HELPERS Y UTILIDADES
    // ════════════════════════════════════════════════

    private _selectBasico() {
        return {
            RA01Folio: true,
            RA01NumeroDeCredito: true,
            RA01NumeroCag: true,
            RA01Nombre: true,
            RA01Sucursal: true,
            RA01FEntrega: true,
            RA01Tipo: true,
            RA01Categoria: true,
            RA01CEntregada: true,
            RA01TipoDeAutorizacion: true,
            RA01SocioRelacionado: true,
            RA01Riesgo: true,
            RA01DiasMora: true,
        };
    }

    private _getZScore(confianza: number): number {
        if (confianza >= 99) return 2.576;
        if (confianza >= 95) return 1.96;
        if (confianza >= 90) return 1.645;
        return 1.64;
    }

    private async _buildFilterWhere(
        filters: Record<string, any> | undefined,
        searchText: string | undefined,
        usuario: Usuario,
        fechaInicio: string,
        fechaFinal: string,
        controlId: number,
    ) {
        const where: any = {
            RA01FEntrega: { gte: fechaInicio, lte: fechaFinal },
            RA01ControlId: controlId,
        };

        const OR: any[] = [];

        // 🔸 Búsqueda global
        if (searchText && searchText.trim() !== '') {
            const term = searchText.trim();
            const isNumeric = /^[0-9]+$/.test(term);

            if (isNumeric) OR.push({ RA01Folio: Number(term) });

            OR.push(
                { RA01NumeroDeCredito: { contains: term, mode: 'insensitive' } },
                { RA01NumeroCag: { contains: term, mode: 'insensitive' } },
                { RA01Nombre: { contains: term, mode: 'insensitive' } },
                { RA01Tipo: { contains: term, mode: 'insensitive' } },
                { RA01Categoria: { contains: term, mode: 'insensitive' } },
            );

            const sucursalesCoincidentes = await this.r11Sucursal.findMany({
                where: {
                    R11Nom: { contains: term, mode: 'insensitive' },
                    R11Coop_id: usuario.R12Coop_id,
                },
                select: { R11NumSuc: true },
            });

            if (sucursalesCoincidentes.length > 0) {
                OR.push({ RA01Sucursal: { in: sucursalesCoincidentes.map((s) => s.R11NumSuc) } });
            }
        }

        // 🔸 Filtros por columna (PrimeNG)
        if (filters) {
            for (const [field, meta] of Object.entries(filters)) {
                const constraintObj = Array.isArray(meta) ? meta[0] : meta?.constraints?.[0] || meta;
                const value = constraintObj?.value;
                const matchMode = constraintObj?.matchMode ?? 'contains';
                if (!value && value !== 0) continue;

                switch (matchMode) {
                    case 'startsWith':
                        where[field] = { startsWith: value, mode: 'insensitive' };
                        break;
                    case 'contains':
                        where[field] = { contains: value, mode: 'insensitive' };
                        break;
                    case 'notContains':
                        where.NOT = where.NOT || [];
                        where.NOT.push({ [field]: { contains: value, mode: 'insensitive' } });
                        break;
                    case 'endsWith':
                        where[field] = { endsWith: value, mode: 'insensitive' };
                        break;
                    case 'equals':
                        where[field] = { equals: isNaN(value) ? value : Number(value) };
                        break;
                    case 'notEquals':
                        where.NOT = where.NOT || [];
                        where.NOT.push({ [field]: { equals: isNaN(value) ? value : Number(value) } });
                        break;
                    default:
                        where[field] = { contains: value, mode: 'insensitive' };
                }

                // Sucursal (nombre → código numérico)
                if (field === 'RA01Sucursal') {
                    const sucursalFilter = await this.r11Sucursal.findMany({
                        where: {
                            R11Nom: { contains: value, mode: 'insensitive' },
                            R11Coop_id: usuario.R12Coop_id,
                        },
                        select: { R11NumSuc: true },
                    });
                    where.RA01Sucursal =
                        sucursalFilter.length > 0
                            ? { in: sucursalFilter.map((s) => s.R11NumSuc) }
                            : { equals: -1 };
                }

                // RA01Folio numérico
                if (field === 'RA01Folio' && !isNaN(Number(value))) {
                    where.RA01Folio = Number(value);
                }
            }
        }

        if (OR.length > 0) where.OR = OR;
        return where;
    }

    private async _generarMuestraGlobal(
        usuario: Usuario,
        filtro: FiltroFechasInput,
        tamanoUniverso: number,
        tamanoMuestra: number,
        controlId: number,
    ) {
        const { fechaInicio, fechaFinal } = filtro;

        const baseWhere = {
            RA01FEntrega: { gte: fechaInicio, lte: fechaFinal },
            RA01ControlId: controlId,
        };

        const universoGlobal = await this.rA01Credito.findMany({
            where: baseWhere,
            select: { RA01Folio: true, RA01Sucursal: true, RA01Tipo: true },
            orderBy: { RA01Sucursal: 'asc' },
        });

        const sucursales = await this.r11Sucursal.findMany({
            where: { R11Coop_id: usuario.R12Coop_id },
            select: { R11NumSuc: true, R11Nom: true },
        });

        const sucursalMap = new Map(sucursales.map((s) => [s.R11NumSuc, s.R11Nom]));
        const universoConSuc = universoGlobal.map((r) => ({
            ...r,
            RA01Sucursal: sucursalMap.get(r.RA01Sucursal) ?? 'No identificada',
        }));

        const indices = new Set<number>();
        while (indices.size < Math.min(tamanoMuestra, tamanoUniverso)) {
            indices.add(Math.floor(Math.random() * tamanoUniverso));
        }

        return Array.from(indices)
            .map((i) => universoConSuc[i])
            .filter(Boolean);
    }

    private async _getLastControlCarga(user: Usuario) {
        const ultimoControl = await this.c01ControlCarga.findFirst({
            orderBy: { C01FechaCarga: 'desc' },
            where: { C01CooperativaCodigo: user.R12Coop_id },
            select: { C01Id: true },
        });

        if (!ultimoControl)
            throw new RpcException({
                message: 'No se encontró ninguna carga de radiografía para esta cooperativa.',
                status: HttpStatus.NOT_FOUND,
            });

        return ultimoControl;
    }


    // * GUARDADO DE MUESTRA (SELECCION)
    public async upsertMuestraSeleccionConFolios(
        usuario: Usuario,
        input: CreateMuestraSeleccionInput,
        folios: number[],
        isUpdate = false,
        muestraId?: number,
    ): Promise<BooleanResponse> {
        try {
            if (!folios?.length) {
                throw new Error('No se recibieron créditos seleccionados.');
            }

            // 🧮 Determinar trimestre actual
            const fechaReferencia = input.A01FechaInicio ? new Date(input.A01FechaInicio) : new Date();
            const trimestre = Math.floor(fechaReferencia.getMonth() / 3) + 1; // 1–4
            const anio = fechaReferencia.getFullYear();

            const rangosTrimestre = [
                { inicio: new Date(anio, 0, 1), fin: new Date(anio, 2, 31, 23, 59, 59) },  // Q1
                { inicio: new Date(anio, 3, 1), fin: new Date(anio, 5, 30, 23, 59, 59) },  // Q2
                { inicio: new Date(anio, 6, 1), fin: new Date(anio, 8, 30, 23, 59, 59) },  // Q3
                { inicio: new Date(anio, 9, 1), fin: new Date(anio, 11, 31, 23, 59, 59) }, // Q4
            ];
            const rangoActual = rangosTrimestre[trimestre - 1];

            // 1️⃣ Validación de muestra existente (solo si no es update)
            if (!isUpdate) {
                const muestraExistente = await this.a01MuestraSeleccionCredito.findFirst({
                    where: {
                        A01CoopId: usuario.R12Coop_id,
                        A01FechaInicio: { gte: rangoActual.inicio },
                        A01FechaFinal: { lte: rangoActual.fin },
                    },
                });

                if (muestraExistente) {
                    throw new Error(`Ya existe una muestra registrada para el trimestre ${trimestre} de ${anio}.`);
                }
            }

            // 2️⃣ Ejecutar transacción
            return await this.$transaction(async (tx) => {
                let muestra;

                // 2.1️⃣ Crear o actualizar cabecera
                if (isUpdate) {
                    if (!muestraId) throw new Error('ID de muestra no proporcionado para actualización.');

                    muestra = await tx.a01MuestraSeleccionCredito.update({
                        where: { A01Id: muestraId },
                        data: {
                            A01MargenError: input.A01MargenError,
                            A01NivelConfianza: input.A01NivelConfianza,
                            A01FechaInicio: input.A01FechaInicio,
                            A01FechaFinal: input.A01FechaFinal,
                            A01TamanoMuestra: input.A01TamanoMuestra,
                            A01TamanoUniverso: input.A01TamanoUniverso,
                            A01Finalizada: input.A01Finalizada ?? true,
                        },
                    });

                    // 🧹 Limpiar créditos anteriores
                    await tx.a02MuestraCreditoSeleccion.deleteMany({
                        where: { A02MuestraId: muestraId },
                    });
                } else {
                    muestra = await tx.a01MuestraSeleccionCredito.create({
                        data: {
                            A01UsuarioId: usuario.R12Id,
                            A01CoopId: usuario.R12Coop_id,
                            A01MargenError: input.A01MargenError,
                            A01NivelConfianza: input.A01NivelConfianza,
                            A01FechaInicio: input.A01FechaInicio,
                            A01FechaFinal: input.A01FechaFinal,
                            A01TamanoMuestra: input.A01TamanoMuestra,
                            A01TamanoUniverso: input.A01TamanoUniverso,
                            A01Finalizada: input.A01Finalizada ?? true,
                        },
                    });
                }

                // 3️⃣ Obtener créditos base
                const creditos = await tx.rA01Credito.findMany({
                    where: { RA01Folio: { in: folios } },
                    select: {
                        RA01Folio: true,
                        RA01NumeroCag: true,
                        RA01Nombre: true,
                        RA01SocioRelacionado: true,
                        RA01NumeroDeCredito: true,
                        RA01Sucursal: true,
                        RA01Tipo: true,
                        RA01Categoria: true,
                        RA01Finalidad: true,
                        RA01DestinoAgropecuario: true,
                        RA01FormaPago: true,
                        RA01FEntrega: true,
                        RA01FVencimiento: true,
                        RA01FConsultaburo: true,
                        RA01Plazo: true,
                        RA01TasaOrdinaria: true,
                        RA01CEntregada: true,
                        RA01TotalCartera: true,
                        RA01GarantiaLiquida: true,
                        RA01GarantiaPrendaria: true,
                        RA01GarantiaHipotecaria: true,
                        RA01TipoDeAutorizacion: true,
                        RA01UsrAutorizacion: true,
                    },
                });

                if (!creditos.length) {
                    throw new Error('No se encontró información de los créditos seleccionados.');
                }

                // 4️⃣ Obtener sucursales y usuarios
                const sucursales = await tx.r11Sucursal.findMany({
                    where: { R11Coop_id: usuario.R12Coop_id },
                    select: { R11NumSuc: true, R11Id: true },
                });
                const mapaSucursales = new Map(sucursales.map(s => [s.R11NumSuc, s.R11Id]));

                const usuariosNis = creditos
                    .map(c => c.RA01UsrAutorizacion)
                    .filter(ni => !!ni);

                const usuarios = await tx.r12Usuario.findMany({
                    where: { R12Ni: { in: usuariosNis } },
                    select: { R12Ni: true, R12Nom: true },
                });
                const mapaUsuarios = new Map(usuarios.map(u => [u.R12Ni, u.R12Nom]));

                // 5️⃣ Armar detalles A02
                const detalles = creditos.map(c => {
                    const sucursalId = mapaSucursales.get(c.RA01Sucursal);
                    const nombreAut = mapaUsuarios.get(c.RA01UsrAutorizacion) ?? 'Usuario no registrado';

                    if (!sucursalId) {
                        throw new Error(`⚠️ No se encontró sucursal con número ${c.RA01Sucursal} para crédito ${c.RA01Folio}`);
                    }

                    return {
                        A02MuestraId: muestra.A01Id,
                        A02CreditoFolio: c.RA01Folio,
                        A02Sucursal: sucursalId,
                        A02CAG: c.RA01NumeroCag,
                        A02Nombre: c.RA01Nombre,
                        A02Relacion: c.RA01SocioRelacionado,
                        A02Prestamo: c.RA01NumeroDeCredito,
                        A02Clasificacion: c.RA01Tipo,
                        A02Producto: c.RA01Categoria,
                        A02Finalidad: c.RA01Finalidad,
                        A02DestinoAgro: c.RA01DestinoAgropecuario,
                        A02TipoPago: c.RA01FormaPago,
                        A02FechaOtorgamiento: c.RA01FEntrega,
                        A02FechaVencimiento: c.RA01FVencimiento,
                        A02FechaConsultaBuro: c.RA01FConsultaburo,
                        A02PlazoDias: c.RA01Plazo,
                        A02TasaInteresNormal: c.RA01TasaOrdinaria,
                        A02CantidadEntregada: c.RA01CEntregada ?? null,
                        A02DeudaTotal: c.RA01TotalCartera,
                        A02GarantiaLiquida: c.RA01GarantiaLiquida,
                        A02GarantiaPrendaria: c.RA01GarantiaPrendaria,
                        A02GarantiaHipotecaria: c.RA01GarantiaHipotecaria,
                        A02TipoAutorizacion: c.RA01TipoDeAutorizacion,
                        A02UsrAutorizacionNi: c.RA01UsrAutorizacion,
                        A02UsrAutorizacionNombre: nombreAut,
                        A02TipoCredito: this._determinarTipoCredito(c.RA01Categoria ?? ''),
                    };
                });

                // 6️⃣ Insertar detalles
                await tx.a02MuestraCreditoSeleccion.createMany({ data: detalles });

                // 7️⃣ Respuesta uniforme
                const action = isUpdate ? 'actualizada' : 'creada';
                return {
                    success: true,
                    message: `Muestra ${action} correctamente con ${detalles.length} créditos.`,
                };
            });
        } catch (error) {
            console.error('❌ Error en upsertMuestraSeleccionConFolios:', error);
            return {
                success: false,
                message: error.message || 'Error al guardar la muestra',
            };
        }
    }


    public async getAllMuestrasSeleccion(
        usuario: Usuario,
        page = 1,
        pageSize = 20,
        paginado = false,
    ): Promise<ResultadoMuestrasResponse> {
        try {
            const where = { A01CoopId: usuario.R12Coop_id };

            // 🔹 Si la paginación está activa, se calcula skip/take
            const safePage = Math.max(1, page);
            const skip = paginado ? (safePage - 1) * pageSize : 0;
            const take = paginado ? pageSize : undefined;

            // 🔹 Total de registros
            const totalRegistros = await this.a01MuestraSeleccionCredito.count({ where });

            // 🔹 Consulta principal con relaciones
            const muestras = await this.a01MuestraSeleccionCredito.findMany({
                where,
                orderBy: { A01FechaCreacion: 'desc' },
                skip,
                take,
                include: {
                    usuario: {
                        select: { R12Id: true, R12Ni: true, R12Nom: true, R12Rol: true },
                    },
                    cooperativa: {
                        select: { R17Id: true, R17Nom: true },
                    },
                    _count: {
                        select: { seleccionados: true },
                    },
                },
            });

            // const muestrasFormateadas = muestras.map((m) => ({
            //     ...m,
            //     A01FechaInicio: m.A01FechaInicio ? new Date(m.A01FechaInicio) : new Date(),
            //     A01FechaFinal: m.A01FechaFinal ? new Date(m.A01FechaFinal) : new Date(),
            //     A01FechaCreacion: m.A01FechaCreacion ? new Date(m.A01FechaCreacion) : new Date(),
            // }));

            // 🔹 Calcular total de páginas solo si aplica
            const totalPaginas = paginado ? Math.ceil(totalRegistros / pageSize) : 1;

            // 🔹 Enriquecer con trimestre y conteo de créditos
            const muestrasMapeadas = muestras.map((m) => {
                const trimestre = this._calcularTrimestre(new Date(m.A01FechaInicio));

                return {
                    ...m,
                    trimestre,
                    totalCreditosSeleccionados: m._count.seleccionados,
                    A01FechaInicio: m.A01FechaInicio ? new Date(m.A01FechaInicio).toISOString() : null,
                    A01FechaFinal: m.A01FechaFinal ? new Date(m.A01FechaFinal).toISOString() : null,
                    A01FechaCreacion: m.A01FechaCreacion ? new Date(m.A01FechaCreacion).toISOString() : null,
                };
            });

            // 🔹 Respuesta uniforme
            return {
                muestras: muestrasMapeadas,
                totalRegistros,
                totalPaginas,
                page,
                pageSize,
            };
        } catch (error) {
            this._logger.error('❌ Error en getAllMuestrasSeleccion:', error);
            throw new Error('Error al obtener las muestras de selección.');
        }
    }

    public async getCreditosSeleccionadosByMuestra(
        user: Usuario,
        input: GetCreditosSeleccionadosInput,
    ): Promise<ResultadoCreditosSeleccionadosResponse> {
        try {
            const { muestraId, filtrarPorSucursal, paginado, page = 1, pageSize = 50 } = input;

            // 1️⃣ Validar existencia de la muestra
            const muestra = await this.a01MuestraSeleccionCredito.findUnique({
                where: { A01Id: muestraId },
                select: { A01Id: true, A01CoopId: true },
            });

            if (!muestra) {
                throw new Error('La muestra indicada no existe.');
            }

            // 2️⃣ Construir filtro base
            const where: any = {
                A02MuestraId: muestraId,
            };

            if (filtrarPorSucursal) {
                where.A02Sucursal = user.R12Suc_id; // o derivado de su relación
            }

            // 3️⃣ Calcular totales
            const totalRegistros = await this.a02MuestraCreditoSeleccion.count({ where });

            // 4️⃣ Obtener datos (paginado o completo)
            let creditos: any[];

            if (paginado) {
                creditos = await this.a02MuestraCreditoSeleccion.findMany({
                    where,
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    include: {
                        sucursal: true,
                        resumenRevisionF1: {
                            include: {
                                auditor: true,
                                responsable: true,
                            }
                        }
                    },
                    orderBy: { A02CreditoFolio: 'asc' },
                });
            } else {
                creditos = await this.a02MuestraCreditoSeleccion.findMany({
                    where,
                    include: {
                        sucursal: true,
                        resumenRevisionF1: {
                            include: {
                                auditor: true,
                                responsable: true,
                            }
                        }
                    },
                    orderBy: { A02CreditoFolio: 'asc' },
                });
            }

            // 5️⃣ Calcular páginas solo si aplica
            const totalPaginas = paginado ? Math.ceil(totalRegistros / pageSize) : 1;

            return {
                creditos,
                totalRegistros,
                totalPaginas,
                page,
                pageSize,
            };
        } catch (error) {
            console.error('❌ Error en getCreditosSeleccionadosByMuestra:', error);
            throw new RpcException({
                message: error.message || 'Error al obtener créditos seleccionados',
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    public async getMuestraDetalleById(
        muestraId: number,
    ): Promise<number[]> {
        try {
            const muestra = await this.a01MuestraSeleccionCredito.findUnique({
                where: { A01Id: muestraId },
                include: {
                    seleccionados: {
                        select: {
                            A02CreditoFolio: true,
                        },
                    },
                },
            });

            if (!muestra) throw new Error('No se encontró la muestra.');

            const foliosSeleccionados = muestra.seleccionados.map(s => s.A02CreditoFolio)

            return foliosSeleccionados
        } catch (error) {
            throw new RpcException({
                message: error.message || 'Error al obtener muestra',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }


    private _determinarTipoCredito(categoria: string): string {
        const categoriasAut = [
            'Prestamo Creo',
            'Socio Fiel Automatico',
            'Automatico simple',
            'Credimejora',
            'Credinsumo',
            'CrediScore',
            'Credimas Consumo',
            'Credimas Comercial',
        ];
        return categoriasAut.some((c) =>
            categoria?.toLowerCase().includes(c.toLowerCase()),
        )
            ? 'Aut.'
            : 'Ord.';
    }

    private _calcularTrimestre(fecha: Date): string {
        const mes = fecha.getMonth() + 1;
        const año = fecha.getFullYear();

        if (mes >= 1 && mes <= 3) return `T1-${año}`;
        if (mes >= 4 && mes <= 6) return `T2-${año}`;
        if (mes >= 7 && mes <= 9) return `T3-${año}`;
        return `T4-${año}`;
    }

}
