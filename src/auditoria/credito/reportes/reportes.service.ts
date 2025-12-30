import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GrupoTipo, PrismaClient } from '@prisma/client';

import { v4 as uuid } from 'uuid'

import { ReporteFase1ResponseDTO, ReporteFase1SucursalRowDTO } from './dto/output/fase1/acredito-reporte-fase1-response.output';
import { Usuario } from 'src/common/entities/usuario.entity';
import { ReporteHallazgosF1Response, SucursalHallazgoDto } from './dto/output/fase1/acredito-reporte-detalle-hallazgos-reponse.output';
import { CategoriaHallazgoDto, ReporteHallazgosF1PorCategoriaResponse } from './dto/output/fase1/acredito-detalle-hallazgos-categoria-response.output';
import { AwsS3Service } from 'src/common/aws/services/aws-s3.service';
import { ExcelService } from 'src/common/excel/services/excel.service';
import { BuildCedulaExcelResponse } from './dto/output/build-cedula-excel-response.output';
import { ReporteSeguimientoAnomaliasResponseDTO, ReporteSeguimientoAnomaliasRowDTO } from './dto/output/fase2/reporte-seguimiento-anomalias-response.output';

const RUBRO_PS_AUT = '% SOBRE AUTORIZADO';

@Injectable()
export class ReportesService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReportesFase1Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    constructor(
        private readonly _awsS3Service: AwsS3Service,
        private readonly _excelService: ExcelService,
    ) {
        super()
    }

    // * FASE 1
    public async getReporteFase1ByMuestra(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteFase1ResponseDTO> {

        const registros = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                resumenRevisionF1: { isNot: null },
                sucursal: { R11Coop_id: user.R12Coop_id }
            },
            select: {
                A02Sucursal: true,
                sucursal: {
                    select: { R11Nom: true }
                },
                resumenRevisionF1: {
                    select: {
                        A04CalA: true,
                        A04CalB: true
                    }
                }
            }
        });

        return this._construirReporteFase1(
            registros,
            r => r.sucursal.R11Nom
        );
    }

    public async getReporteFase1ByClasificacion(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteFase1ResponseDTO> {

        const registros = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                resumenRevisionF1: { isNot: null },
                sucursal: { R11Coop_id: user.R12Coop_id }
            },
            select: {
                A02Clasificacion: true,
                resumenRevisionF1: {
                    select: {
                        A04CalA: true,
                        A04CalB: true
                    }
                }
            }
        });

        return this._construirReporteFase1(
            registros,
            r => r.A02Clasificacion ?? 'SIN CLASIFICACIÓN'
        );
    }

    async getDetalleHallazgosFase1ByMuestra(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteHallazgosF1Response> {

        // 1️⃣ Rubros y elementos del grupo ACREDITO
        const rubros = await this.r03Rubro.findMany({
            where: {
                grupo: {
                    R02Tipo: GrupoTipo.ACREDITO,
                    R02Coop_id: user.R12Coop_id,
                },
            },
            include: {
                elementos: {
                    select: {
                        R04Nom: true,
                        R04Imp: true,
                    },
                },
            },
        });

        // Mapa base rubros → elementos
        const rubrosBaseMap = new Map<string, Map<string, string>>();
        for (const r of rubros) {
            if (!rubrosBaseMap.has(r.R03Nom)) {
                rubrosBaseMap.set(r.R03Nom, new Map());
            }
            for (const e of r.elementos) {
                rubrosBaseMap.get(r.R03Nom)!.set(e.R04Nom, e.R04Imp);
            }
        }
        // ➕ Rubro virtual: % SOBRE AUTORIZADO
        rubrosBaseMap.set(
            RUBRO_PS_AUT,
            new Map([[RUBRO_PS_AUT, 'ALTO']])
        );

        // 2️⃣ Créditos seleccionados de la muestra
        const creditos = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                sucursal: { R11Coop_id: user.R12Coop_id },
                resumenRevisionF1: { isNot: null }
            },
            include: {
                sucursal: true,
                evaluacionRevisionF1: {
                    where: { A03Res: 'I' },
                    include: {
                        elemento: {
                            select: {
                                R04Nom: true,
                                R04Imp: true,
                                rubro: { select: { R03Nom: true } },
                            },
                        },
                    },
                },
                resumenRevisionF1: {
                    include: {
                        responsable: true,
                    },
                },
            },
        });

        let totalHallazgosGlobal = 0;
        const sucursalesMap = new Map<string, SucursalHallazgoDto>();

        // 3️⃣ Recorrer créditos
        for (const c of creditos) {
            const sucId = c.sucursal.R11Id;
            const sucNom = c.sucursal.R11Nom;

            if (!sucursalesMap.has(sucId)) {
                sucursalesMap.set(sucId, {
                    id: sucId,
                    nombre: sucNom,
                    totalCreditos: 0,
                    totalHallazgos: 0,
                    rubros: Array.from(rubrosBaseMap.entries()).map(([rubro, elementos]) => ({
                        rubro,
                        total: 0,
                        elementos: Array.from(elementos.entries()).map(([elemento, impacto]) => ({
                            elemento,
                            impacto,
                            total: 0
                        }))
                    })),
                    ejecutivos: [],
                });
            }

            const sucursal = sucursalesMap.get(sucId)!;
            sucursal.totalCreditos++;

            // Regla % sobre autorizado
            const psAut = this.parseNumber(c.resumenRevisionF1?.A04PSAut);
            const hayHallazgoPSAut = psAut > 0 && this.isNo(c.resumenRevisionF1?.A04Excep);

            // Ejecutivo
            const ejeId = c.resumenRevisionF1?.responsable?.R12Id ?? '0';
            const ejeNom = c.resumenRevisionF1?.responsable?.R12Nom ?? 'Sin asignar';

            let ejecutivo = sucursal.ejecutivos.find(e => e.id === ejeId);
            if (!ejecutivo) {
                ejecutivo = {
                    id: ejeId,
                    nombre: ejeNom,
                    totalCreditos: 0,
                    totalHallazgos: 0,
                    rubros: JSON.parse(JSON.stringify(sucursal.rubros)),
                };
                sucursal.ejecutivos.push(ejecutivo);
            }
            ejecutivo.totalCreditos++;

            // % SOBRE AUTORIZADO
            if (hayHallazgoPSAut) {
                sucursal.totalHallazgos++;
                ejecutivo.totalHallazgos++;
                totalHallazgosGlobal++;

                const rubroPsSuc = sucursal.rubros.find(r => r.rubro === RUBRO_PS_AUT);
                rubroPsSuc && (rubroPsSuc.total++, rubroPsSuc.elementos[0].total++);

                const rubroPsEje = ejecutivo.rubros.find(r => r.rubro === RUBRO_PS_AUT);
                rubroPsEje && (rubroPsEje.total++, rubroPsEje.elementos[0].total++);
            }

            // Evaluaciones incorrectas
            for (const ev of c.evaluacionRevisionF1) {

                const rubroNom = ev.elemento?.rubro?.R03Nom;
                const elemNom = ev.elemento?.R04Nom;
                if (!rubroNom || !elemNom) continue;

                const rubroSuc = sucursal.rubros.find(r => r.rubro === rubroNom);
                const elemSuc = rubroSuc?.elementos.find(e => e.elemento === elemNom);
                if (elemSuc) {
                    elemSuc.total++;
                    rubroSuc!.total++;
                }

                const rubroEje = ejecutivo.rubros.find(r => r.rubro === rubroNom);
                const elemEje = rubroEje?.elementos.find(e => e.elemento === elemNom);
                if (elemEje) {
                    elemEje.total++;
                    rubroEje!.total++;
                }

                sucursal.totalHallazgos++;
                ejecutivo.totalHallazgos++;
                totalHallazgosGlobal++;
            }
        }

        // 4️⃣ Limpieza
        const sucursales = Array.from(sucursalesMap.values()).map(s => ({
            ...s,
            // opcional: filtra ejecutivos sin hallazgos o déjalos si quieres verlos
            ejecutivos: s.ejecutivos.filter(e => e.totalHallazgos > 0),
        }));


        return {
            totalCreditosGlobal: creditos.length,
            totalHallazgosGlobal,
            sucursales,
        };
    }

    async getDetalleHallazgosFase1ByMuestraPorCategoria(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteHallazgosF1PorCategoriaResponse> {

        // 1️⃣ Rubros y elementos del grupo ACREDITO
        const rubros = await this.r03Rubro.findMany({
            where: {
                grupo: {
                    R02Tipo: GrupoTipo.ACREDITO,
                    R02Coop_id: user.R12Coop_id,
                },
            },
            include: {
                elementos: {
                    select: {
                        R04Nom: true,
                        R04Imp: true,
                    },
                },
            },
        });

        // Rubros base
        const rubrosBase = Array.from(rubros).map(r => ({
            rubro: r.R03Nom,
            total: 0,
            elementos: r.elementos.map(e => ({
                elemento: e.R04Nom,
                impacto: e.R04Imp,
                total: 0,
            })),
        }));
        rubrosBase.push({
            rubro: RUBRO_PS_AUT,
            total: 0,
            elementos: [
                {
                    elemento: RUBRO_PS_AUT,
                    impacto: 'ALTO',
                    total: 0,
                },
            ],
        });

        // 2️⃣ Créditos de la muestra
        const creditos = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                sucursal: { R11Coop_id: user.R12Coop_id },
                resumenRevisionF1: { isNot: null }
            },
            include: {
                evaluacionRevisionF1: {
                    where: { A03Res: 'I' },
                    include: {
                        elemento: {
                            select: {
                                R04Nom: true,
                                rubro: { select: { R03Nom: true } },
                            },
                        },
                    },
                },
                resumenRevisionF1: true,
            },
        });

        let totalHallazgosGlobal = 0;
        const categoriasMap = new Map<string, CategoriaHallazgoDto>();

        // 3️⃣ Recorrido de créditos
        for (const c of creditos) {

            const categoria = c.A02Clasificacion ?? 'SIN CLASIFICACIÓN';

            if (!categoriasMap.has(categoria)) {
                categoriasMap.set(categoria, {
                    categoria,
                    totalCreditos: 0,
                    totalHallazgos: 0,
                    rubros: JSON.parse(JSON.stringify(rubrosBase)),
                });
            }

            const cat = categoriasMap.get(categoria)!;
            cat.totalCreditos++;

            // Regla % sobre autorizado
            const psAut = this.parseNumber(c.resumenRevisionF1?.A04PSAut);
            const hayHallazgoPSAut = psAut > 0 && this.isNo(c.resumenRevisionF1?.A04Excep);

            if (hayHallazgoPSAut) {
                // Total categoría
                cat.totalHallazgos++;
                totalHallazgosGlobal++;

                // Rubro virtual
                const rubroPs = cat.rubros.find(r => r.rubro === RUBRO_PS_AUT);
                if (rubroPs) {
                    rubroPs.total++;
                    rubroPs.elementos[0].total++;
                }
            }

            // Hallazgos por elementos incorrectos
            for (const ev of c.evaluacionRevisionF1) {
                const rubroNom = ev.elemento?.rubro?.R03Nom;
                const elemNom = ev.elemento?.R04Nom;
                if (!rubroNom || !elemNom) continue;

                const rubro = cat.rubros.find(r => r.rubro === rubroNom);
                const elem = rubro?.elementos.find(e => e.elemento === elemNom);

                if (elem) {
                    elem.total++;
                    rubro!.total++;
                }

                cat.totalHallazgos++;
                totalHallazgosGlobal++;
            }
        }

        // 4️⃣ Resultado
        return {
            totalCreditosGlobal: creditos.length,
            totalHallazgosGlobal,
            categorias: Array.from(categoriasMap.values()),
        };
    }

    async buildCedulaF1(muestraId: number, user: Usuario): Promise<BuildCedulaExcelResponse> {

        const creditos = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                sucursal: { R11Coop_id: user.R12Coop_id },
            },
            include: {
                sucursal: true,
                resumenRevisionF1: true,
            },
            orderBy: {
                A02CreditoFolio: 'asc',
            },
        });

        const rows = creditos.map(c => ({
            FOLIO_CREDITO: c.A02CreditoFolio,
            CAG: c.A02CAG,
            SOCIO: c.A02Nombre,
            RELACION: c.A02Relacion,
            SUCURSAL: c.sucursal?.R11Nom ?? '',
            PRESTAMO: c.A02Prestamo,
            PRODUCTO: c.A02Producto,
            EJECUTIVO: c.A02UsrAutorizacionNombre,
            OBSERVACIONES: c.resumenRevisionF1?.A04Obs ?? '',
            CALIFICATIVO: c.resumenRevisionF1?.A04CalA ?? 'PENDIENTE',
            TOLERANCIA: c.resumenRevisionF1?.A04CalB ?? 'PENDIENTE',
        }));

        const buffer = this._excelService.buildExcelBuffer({
            rows,
            sheetName: 'Relación de Créditos Revisados',
            headers: [
                'FOLIO_CREDITO',
                'CAG',
                'SOCIO',
                'RELACION',
                'SUCURSAL',
                'PRESTAMO',
                'PRODUCTO',
                'EJECUTIVO',
                'OBSERVACIONES',
                'CALIFICATIVO',
                'TOLERANCIA',
            ],
            columnWidths: [
                15, // Folio
                10, // CAG
                30, // Socio
                15, // Relación
                20, // Sucursal
                15, // Préstamo
                20, // Producto
                25, // Ejecutivo
                60, // Observaciones
                15, // Calificativo
                15, // Tolerancia
            ],
        });


        const filename = `Cedula_F1${muestraId}.xlsx`;

        const { key } = await this._awsS3Service.uploadBuffer({
            buffer,
            key: `auditoria/cedulas/${uuid()}-${filename}`,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const signedUrl = await this._awsS3Service.getSignedDownloadUrl({
            key,
            expiresInSeconds: 60 * 15, // 15 minutos
        });

        return {
            url: signedUrl,
            totalRegistros: rows.length,
        };
    }

    // * FASE 2
    public async getReporteSeguimientoAnomaliasByMuestra(
        muestraId: number,
        user: Usuario
    ): Promise<ReporteSeguimientoAnomaliasResponseDTO> {

        const registros = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                sucursal: { R11Coop_id: user.R12Coop_id },
                resumenRevisionF2: { isNot: null }
            },
            select: {
                sucursal: {
                    select: { R11Nom: true }
                },
                resumenRevisionF1: {
                    select: { A04Ha: true }
                },
                resumenRevisionF2: {
                    select: {
                        A06ARes: true,
                        A06Solv: true,
                        A06NSolv: true
                    }
                }
            }
        });

        return this._construirReporteSeguimientoAnomalias(
            registros,
            r => r.sucursal.R11Nom
        );
    }

    async buildCedulaF2(muestraId: number, user: Usuario): Promise<BuildCedulaExcelResponse> {

        const creditos = await this.a02MuestraCreditoSeleccion.findMany({
            where: {
                A02MuestraId: muestraId,
                sucursal: { R11Coop_id: user.R12Coop_id },
            },
            include: {
                sucursal: true,
                resumenRevisionF1: true,
                resumenRevisionF2: {
                    include: {
                        auditor: true,
                    }
                },
            },
            orderBy: {
                A02CreditoFolio: 'asc',
            },
        });

        const rows = creditos.map(c => ({
            FOLIO_CREDITO: c.A02CreditoFolio,
            CAG: c.A02CAG,
            SOCIO: c.A02Nombre,
            SUCURSAL: c.sucursal?.R11Nom ?? '',
            PRESTAMO: c.A02Prestamo,
            CALIFICATIVO: c.resumenRevisionF1?.A04CalA ?? 'PENDIENTE',
            TOLERANCIA: c.resumenRevisionF1?.A04CalB ?? 'PENDIENTE',
            RESPONSABLE: c.A02UsrAutorizacionNombre,
            AUDITOR_SEG: c.resumenRevisionF2?.auditor.R12Nom ?? '---',
            OBSERVACIONES_INICIALES: c.resumenRevisionF1?.A04Obs ?? '',
            COMPROMISO: c.resumenRevisionF1?.A04Comp ?? '---',
            PLAZO_FECHA: c.resumenRevisionF1?.A04FPlzo ? new Date(c.resumenRevisionF1.A04FPlzo) : '---',
            HALLAZGOS: c.resumenRevisionF1?.A04Ha,
            SOLVENTADOS: c.resumenRevisionF2?.A06Solv,
            NO_SOLVENTADOS: c.resumenRevisionF2?.A06NSolv,
            ACCION_RESULTADO: c.resumenRevisionF2?.A06ARes,
            OBSERVACIONES_SEG: c.resumenRevisionF2?.A06Obs,
        }));

        const buffer = this._excelService.buildExcelBuffer({
            rows,
            sheetName: 'Relación de Créditos Revisados',
            headers: [
                'FOLIO_CREDITO',
                'CAG',
                'SOCIO',
                'SUCURSAL',
                'PRESTAMO',
                'CALIFICATIVO',
                'TOLERANCIA',
                'RESPONSABLE',
                'AUDITOR_SEG',
                'OBSERVACIONES_INICIALES',
                'COMPROMISO',
                'PLAZO_FECHA',
                'HALLAZGOS',
                'SOLVENTADOS',
                'NO_SOLVENTADOS',
                'ACCION_RESULTADO',
                'OBSERVACIONES_SEG',
            ],
            columnWidths: [
                15, // Folio
                10, // CAG
                30, // Socio
                20, // Sucursal
                15, // Préstamo
                15, // Calificativo
                15, // Tolerancia
                25, // Ejecutivo
                25, // Auditor Seguimiento
                60, // Observaciones
                60, // Compromisos
                15, // Plazo Fecha
                10, // Hallazgos
                10, // Solventados
                10, // No Solventados
                15, // Accion Resultado
                60, // Observaciones Seg
            ],
        });


        const filename = `Cedula_F2${muestraId}.xlsx`;

        const { key } = await this._awsS3Service.uploadBuffer({
            buffer,
            key: `auditoria/cedulas/${uuid()}-${filename}`,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const signedUrl = await this._awsS3Service.getSignedDownloadUrl({
            key,
            expiresInSeconds: 60 * 15, // 15 minutos
        });

        return {
            url: signedUrl,
            totalRegistros: rows.length,
        };
    }


    // *============================
    // * HELPERS
    // *============================

    private _construirReporteFase1<
        T extends {
            resumenRevisionF1?: {
                A04CalA?: string;
                A04CalB?: string;
            } | null;
        }
    >(
        registros: T[],
        getKey: (r: T) => string
    ): ReporteFase1ResponseDTO {

        const mapa = new Map<string, ReporteFase1SucursalRowDTO>();

        for (const r of registros) {
            const key = getKey(r);

            if (!mapa.has(key)) {
                mapa.set(key, {
                    sucursal: key, // campo genérico
                    expedientesRevisados: 0,
                    correctos: 0,
                    deficientes: 0,
                    cumplimiento: 0,
                    incumplimiento: 0,
                    aceptables: 0,
                    graves: 0
                });
            }

            const row = mapa.get(key)!;

            row.expedientesRevisados++;

            if (r.resumenRevisionF1?.A04CalA === 'CORRECTO') {
                row.correctos++;
            }

            if (r.resumenRevisionF1?.A04CalA === 'DEFICIENTE') {
                row.deficientes++;
            }

            if (r.resumenRevisionF1?.A04CalB === 'ACEPTABLE') {
                row.aceptables++;
            }

            if (r.resumenRevisionF1?.A04CalB === 'GRAVE') {
                row.graves++;
            }
        }

        const rows = Array.from(mapa.values()).map(r => ({
            ...r,
            cumplimiento: r.expedientesRevisados
                ? +(r.correctos / r.expedientesRevisados * 100).toFixed(2)
                : 0,
            incumplimiento: r.expedientesRevisados
                ? +(r.deficientes / r.expedientesRevisados * 100).toFixed(2)
                : 0
        }));

        const totales = rows.reduce((acc, r) => {
            acc.expedientesRevisados += r.expedientesRevisados;
            acc.correctos += r.correctos;
            acc.deficientes += r.deficientes;
            acc.aceptables += r.aceptables;
            acc.graves += r.graves;
            return acc;
        }, {
            expedientesRevisados: 0,
            correctos: 0,
            deficientes: 0,
            cumplimiento: 0,
            incumplimiento: 0,
            aceptables: 0,
            graves: 0
        });

        totales.cumplimiento = totales.expedientesRevisados
            ? +(totales.correctos / totales.expedientesRevisados * 100).toFixed(2)
            : 0;

        totales.incumplimiento = totales.expedientesRevisados
            ? +(totales.deficientes / totales.expedientesRevisados * 100).toFixed(2)
            : 0;

        return { rows, totales };
    }

    private _construirReporteSeguimientoAnomalias<
        T extends {
            resumenRevisionF1?: { A04Ha?: number } | null;
            resumenRevisionF2?: {
                A06ARes?: 'SOLVENTADO' | 'NO_SOLVENTADO';
                A06Solv?: number;
                A06NSolv?: number;
            } | null;
        }
    >(
        registros: T[],
        getKey: (r: T) => string
    ): ReporteSeguimientoAnomaliasResponseDTO {

        const mapa = new Map<string, ReporteSeguimientoAnomaliasRowDTO>();

        for (const r of registros) {
            const key = getKey(r);

            if (!mapa.has(key)) {
                mapa.set(key, {
                    sucursal: key,

                    expedientesSeguimiento: 0,
                    solventadosExp: 0,
                    noSolventadosExp: 0,
                    cumplimiento: 0,
                    incumplimiento: 0,

                    hallazgos: 0,
                    solventadosHall: 0,
                    noSolventadosHall: 0,
                    corregidos: 0,
                    sinCorregir: 0
                });
            }

            const row = mapa.get(key)!;

            // ───────── Expedientes ─────────
            row.expedientesSeguimiento++;

            if (r.resumenRevisionF2?.A06ARes === 'SOLVENTADO') {
                row.solventadosExp++;
            }

            if (r.resumenRevisionF2?.A06ARes === 'NO_SOLVENTADO') {
                row.noSolventadosExp++;
            }

            // ───────── Hallazgos ─────────
            row.hallazgos += r.resumenRevisionF1?.A04Ha ?? 0;
            row.solventadosHall += r.resumenRevisionF2?.A06Solv ?? 0;
            row.noSolventadosHall += r.resumenRevisionF2?.A06NSolv ?? 0;
        }

        const rows = Array.from(mapa.values()).map(r => ({
            ...r,
            cumplimiento: r.expedientesSeguimiento
                ? +(r.solventadosExp / r.expedientesSeguimiento * 100).toFixed(2)
                : 0,
            incumplimiento: r.expedientesSeguimiento
                ? +(r.noSolventadosExp / r.expedientesSeguimiento * 100).toFixed(2)
                : 0,
            corregidos: r.hallazgos
                ? +(r.solventadosHall / r.hallazgos * 100).toFixed(2)
                : 0,
            sinCorregir: r.hallazgos
                ? +(r.noSolventadosHall / r.hallazgos * 100).toFixed(2)
                : 0
        }));

        const totales = rows.reduce((acc, r) => {
            acc.expedientesSeguimiento += r.expedientesSeguimiento;
            acc.solventadosExp += r.solventadosExp;
            acc.noSolventadosExp += r.noSolventadosExp;
            acc.hallazgos += r.hallazgos;
            acc.solventadosHall += r.solventadosHall;
            acc.noSolventadosHall += r.noSolventadosHall;
            return acc;
        }, {
            expedientesSeguimiento: 0,
            solventadosExp: 0,
            noSolventadosExp: 0,
            cumplimiento: 0,
            incumplimiento: 0,
            hallazgos: 0,
            solventadosHall: 0,
            noSolventadosHall: 0,
            corregidos: 0,
            sinCorregir: 0
        });

        totales.cumplimiento = totales.expedientesSeguimiento
            ? +(totales.solventadosExp / totales.expedientesSeguimiento * 100).toFixed(2)
            : 0;

        totales.incumplimiento = totales.expedientesSeguimiento
            ? +(totales.noSolventadosExp / totales.expedientesSeguimiento * 100).toFixed(2)
            : 0;

        totales.corregidos = totales.hallazgos
            ? +(totales.solventadosHall / totales.hallazgos * 100).toFixed(2)
            : 0;

        totales.sinCorregir = totales.hallazgos
            ? +(totales.noSolventadosHall / totales.hallazgos * 100).toFixed(2)
            : 0;

        return { rows, totales };
    }


    private parseNumber(value: unknown): number {
        if (value === null || value === undefined) return 0;
        const s = String(value).trim();
        if (!s) return 0;
        // si viene con % o separadores, limpiamos
        const cleaned = s.replace(/[^0-9.-]/g, '');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
    }

    private isNo(value: unknown): boolean {
        return String(value ?? '').trim().toLowerCase() === 'no';
    }


}
