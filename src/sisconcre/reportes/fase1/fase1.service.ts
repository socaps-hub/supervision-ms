import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Calificativo, PrismaClient, Resolucion } from '@prisma/client';
import { FiltroFechasInput } from 'src/sisconcre/common/dto/filtro-fechas.input';
import { ReporteSegmentadoFase1Response, ReporteSegmentadoSucursal } from '../dto/fase1/reporte-segmentado-f1.output';
import { DetalleAnomaliasF1Response, DetalleRubroPorSucursal, ElementosIncorrectosPorSucursal } from '../dto/fase1/detalle-anomalias-f1.output';
import { ResFaseI } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';
import { AnomaliasResumenResponseF1, GrupoResumenGlobal, SucursalResumen } from '../dto/fase1/detalle-anomalias-integral-f1.output';
import { DetalleAnomaliasEjecutivoF1Response, EjecutivoDetalle, TotalesColumnasDetalle } from '../dto/fase1/detalle-anomalias-f1-ejecutivo.output';
import { Usuario } from 'src/common/entities/usuario.entity';
import { AnomaliasEjecutivoResumen, DetalleAnomaliasIntegralEjecutivosResponseF1 } from '../dto/fase1/detalle-anomalias-integral-f1-ejecutivos.output';

@Injectable()
export class ReporteFase1Service extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('ReportesFase1Service')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    async getReporteSegmentadoF1(input: FiltroFechasInput, user: Usuario): Promise<ReporteSegmentadoFase1Response> {
        const { fechaInicio, fechaFinal } = input;

        const solicitudes = await this.r01Prestamo.findMany({
            where: {
                R01FRec: {
                    gte: new Date(fechaInicio).toISOString(),
                    lte: new Date(fechaFinal).toISOString(),
                },
                R01Coop_id: user.R12Coop_id,
                R01Est: 'Sin seguimiento',
            },
            include: {
                sucursal: true,
                resumenF1: true,
            },
        });

        const agrupadas = new Map<string, ReporteSegmentadoSucursal>();

        // Totales globales
        let totalAnomaliasDevueltas = 0;
        let totalAnomaliasComite = 0;
        let totalAnomalias = 0;

        let totalCorrectas = 0;
        let totalAceptables = 0;
        let totalDeficientes = 0;

        for (const solicitud of solicitudes) {
            const sucursalNombre = solicitud.sucursal?.R11Nom ?? 'Desconocida';

            if (!agrupadas.has(sucursalNombre)) {
                agrupadas.set(sucursalNombre, {
                    sucursal: sucursalNombre,
                    total: 0,
                    devueltas: 0,
                    porcentajeDevueltas: 0,
                    anomaliasDevueltas: 0,
                    comite: 0,
                    porcentajeComite: 0,
                    correctas: 0,
                    porcentajeCorrectas: 0,
                    aceptables: 0,
                    porcentajeAceptables: 0,
                    deficientes: 0,
                    porcentajeDeficientes: 0,
                    anomaliasComite: 0,
                    totalAnomalias: 0,
                });
            }

            const item = agrupadas.get(sucursalNombre)!;
            item.total++;

            const resumen = solicitud.resumenF1;
            const res = resumen?.R06Res;
            const cal = resumen?.R06Cal ?? '';
            const anomaliasTotales = (resumen?.R06Ha ?? 0) + (resumen?.R06Hm ?? 0) + (resumen?.R06Hb ?? 0);

            totalAnomalias += anomaliasTotales;

            if (res === Resolucion.DEVUELTA) {
                item.devueltas++;
                item.anomaliasDevueltas += anomaliasTotales;
                totalAnomaliasDevueltas += anomaliasTotales;
            }

            if (res === Resolucion.PASA_COMITE) {
                item.comite++;
                item.anomaliasComite += anomaliasTotales;
                item.totalAnomalias += anomaliasTotales;
                totalAnomaliasComite += anomaliasTotales;

                if (cal === Calificativo.CORRECTO) {
                    item.correctas++;
                    totalCorrectas++;
                } else if (cal === Calificativo.ACEPTABLE) {
                    item.aceptables++;
                    totalAceptables++;
                } else if (cal === Calificativo.DEFICIENTE) {
                    item.deficientes++;
                    totalDeficientes++;
                }

            } else {
                item.totalAnomalias += anomaliasTotales;
            }
        }

        const sucursales = Array.from(agrupadas.values()).map((item) => {
            item.porcentajeDevueltas = item.total > 0 ? Math.round((item.devueltas / item.total) * 100) : 0;
            item.porcentajeComite = item.total > 0 ? Math.round((item.comite / item.total) * 100) : 0;

            item.porcentajeCorrectas = item.comite > 0 ? Math.round((item.correctas / item.comite) * 100) : 0;
            item.porcentajeAceptables = item.comite > 0 ? Math.round((item.aceptables / item.comite) * 100) : 0;
            item.porcentajeDeficientes = item.comite > 0 ? Math.round((item.deficientes / item.comite) * 100) : 0;

            return item;
        });

        const totalSolicitudes = solicitudes.length;
        const totalDevueltas = sucursales.reduce((acc, s) => acc + s.devueltas, 0);
        const totalComite = sucursales.reduce((acc, s) => acc + s.comite, 0);

        return {
            sucursales,
            totalSolicitudes,
            totalDevueltas,
            porcentajeDevueltas: totalSolicitudes > 0 ? Math.round((totalDevueltas / totalSolicitudes) * 100) : 0,
            totalComite,
            porcentajeComite: totalSolicitudes > 0 ? Math.round((totalComite / totalSolicitudes) * 100) : 0,
            totalAnomaliasDevueltas,
            totalAnomaliasComite,
            totalAnomalias,
            totalCorrectas,
            totalAceptables,
            totalDeficientes,
            porcentajeCorrectas: totalSolicitudes > 0 ? Math.round((totalCorrectas / totalSolicitudes) * 100) : 0,
            porcentajeAceptables: totalSolicitudes > 0 ? Math.round((totalAceptables / totalSolicitudes) * 100) : 0,
            porcentajeDeficientes: totalSolicitudes > 0 ? Math.round((totalDeficientes / totalSolicitudes) * 100) : 0,
        };
    }

    async getDetalleAnomalias(input: FiltroFechasInput, user: Usuario): Promise<DetalleAnomaliasF1Response> {
        const { fechaInicio, fechaFinal } = input;

        // 🧩 Obtener todos los rubros y elementos registrados
        const rubros = await this.r03Rubro.findMany({
            where: {
                grupo: { R02Coop_id: user.R12Coop_id }
            },
            include: {
                elementos: {
                    select: {
                        R04Nom: true,
                        R04Imp: true,
                    },
                },
                grupo: true,
            },
        });

        // 🧩 Inicialización base de rubros con sus elementos
        const rubrosBaseMap = new Map<string, Map<string, string>>(); // rubro -> (elemento -> impacto)

        for (const r of rubros) {
            if (!rubrosBaseMap.has(r.R03Nom)) {
                rubrosBaseMap.set(r.R03Nom, new Map());
            }
            for (const e of r.elementos) {
                rubrosBaseMap.get(r.R03Nom)!.set(e.R04Nom, e.R04Imp);
            }
        }

        // 🧩 Traer solicitudes con evaluaciones "I"
        const solicitudes = await this.r01Prestamo.findMany({
            where: {
                R01Est: 'Sin seguimiento',
                R01FRec: {
                    gte: new Date(fechaInicio).toISOString(),
                    lte: new Date(fechaFinal).toISOString(),
                },
                R01Coop_id: user.R12Coop_id,
                resumenF1: {
                    R06Res: Resolucion.PASA_COMITE,
                },
            },
            include: {
                sucursal: true,
                evaluacionesF1: {
                    where: {
                        R05Res: 'I',
                    },
                    include: {
                        elemento: {
                            select: {
                                R04Nom: true,
                                R04Imp: true,
                                rubro: {
                                    select: {
                                        R03Nom: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // 🛠️ Verificar si hay rubros/elementos no declarados y agregarlos
        for (const solicitud of solicitudes) {
            for (const ev of solicitud.evaluacionesF1) {
                const rubroNombre = ev.elemento?.rubro?.R03Nom;
                const elementoNombre = ev.elemento?.R04Nom;
                const impacto = ev.elemento?.R04Imp ?? 'BAJO';

                if (!rubroNombre || !elementoNombre) continue;

                if (!rubrosBaseMap.has(rubroNombre)) {
                    rubrosBaseMap.set(rubroNombre, new Map());
                }

                const elementos = rubrosBaseMap.get(rubroNombre)!;
                if (!elementos.has(elementoNombre)) {
                    elementos.set(elementoNombre, impacto);
                }
            }
        }

        // Reconstruir rubrosBase con todo lo necesario
        const rubrosBase = Array.from(rubrosBaseMap.entries()).map(([rubro, elementosMap]) => ({
            rubro,
            elementos: Array.from(elementosMap.entries()).map(([elemento, impacto]) => ({
                elemento,
                impacto,
            })),
        }));

        // 🧠 Mapa final por sucursal
        let totalIncorrectosGlobal = 0;
        const sucursalesMap = new Map<string, ElementosIncorrectosPorSucursal>();

        for (const solicitud of solicitudes) {
            const sucursalNombre = solicitud.sucursal?.R11Nom ?? 'Desconocida';

            if (!sucursalesMap.has(sucursalNombre)) {
                sucursalesMap.set(sucursalNombre, {
                    nombre: sucursalNombre,
                    totalSolicitudes: 0,
                    totalIncorrectos: 0,
                    elementosIncorrectos: [],
                    rubros: [],
                });
            }

            const sucursal = sucursalesMap.get(sucursalNombre)!;
            sucursal.totalSolicitudes++;

            // Si es la primera vez que ves esta sucursal, inicializas sus rubros
            if (sucursal.rubros.length === 0) {
                sucursal.rubros = rubrosBase.map(rb => ({
                    rubro: rb.rubro,
                    total: 0,
                    porcentaje: 0,
                    elementos: rb.elementos.map(e => ({
                        elemento: e.elemento,
                        total: 0,
                        impacto: e.impacto,
                    })),
                }));
            }

            // Acumular los incorrectos en los rubros existentes
            for (const ev of solicitud.evaluacionesF1) {
                const rubroNombre = ev.elemento?.rubro?.R03Nom;
                const elementoNombre = ev.elemento?.R04Nom;

                if (!rubroNombre || !elementoNombre) continue;

                const rubroItem = sucursal.rubros.find(r => r.rubro === rubroNombre);
                if (!rubroItem) continue;

                const elItem = rubroItem.elementos.find(e => e.elemento === elementoNombre);
                if (!elItem) continue;

                elItem.total++;
                rubroItem.total++;
                sucursal.totalIncorrectos++;
                totalIncorrectosGlobal++;
            }


            // Contador por elemento incorrecto para sección superior
            const elementosContados = new Map<string, number>();
            for (const rubro of sucursal.rubros) {
                for (const el of rubro.elementos) {
                    if (el.total > 0) {
                        elementosContados.set(el.elemento, (elementosContados.get(el.elemento) ?? 0) + el.total);
                    }
                }
            }

            sucursal.elementosIncorrectos = Array.from(elementosContados.entries()).map(([elemento, cantidad]) => ({
                elemento,
                cantidad,
            }));
        }

        // Porcentajes de rubros
        for (const sucursal of sucursalesMap.values()) {
            for (const rubro of sucursal.rubros) {
                rubro.porcentaje = totalIncorrectosGlobal > 0
                    ? Math.round((rubro.total / totalIncorrectosGlobal) * 100)
                    : 0;
            }
        }

        return {
            totalSolicitudes: solicitudes.length,
            totalIncorrectosGlobal,
            sucursales: Array.from(sucursalesMap.values()),
        };
    }

    async getDetalleAnomaliasIntegralPorGrupos(input: FiltroFechasInput, user: Usuario): Promise<AnomaliasResumenResponseF1> {
        const { fechaInicio, fechaFinal } = input;

        const prestamos = await this.r01Prestamo.findMany({
            where: {
                R01FRec: {
                    gte: new Date(fechaInicio).toISOString(),
                    lte: new Date(fechaFinal).toISOString(),
                },
                R01Coop_id: user.R12Coop_id,
                R01Est: 'Sin seguimiento',
                R01Activ: true,
                resumenF1: {
                    R06Res: Resolucion.PASA_COMITE
                }
            },
            include: {
                sucursal: true,
                evaluacionesF1: {
                    include: {
                        elemento: {
                            include: {
                                rubro: {
                                    include: {
                                        grupo: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const sucursalMap = new Map<string, SucursalResumen>();
        const gruposGlobal = new Map<string, number>();

        let totalSolicitudesGlobal = 0;
        let totalHallazgosGlobal = 0;

        // 1️⃣ Obtener lista global de todos los grupos (sin "Desembolso")
        const todosLosGruposSet = new Set<string>();
        for (const prestamo of prestamos) {
            for (const evaluacion of prestamo.evaluacionesF1) {
                const grupo = evaluacion.elemento.rubro.grupo.R02Nom;
                if (grupo !== 'Desembolso') {
                    todosLosGruposSet.add(grupo);
                }
            }
        }
        const todosLosGrupos = Array.from(todosLosGruposSet).sort();

        // 2️⃣ Recorrer prestamos
        for (const prestamo of prestamos) {
            const sucursal = prestamo.sucursal.R11Nom;

            if (!sucursalMap.has(sucursal)) {
                sucursalMap.set(sucursal, {
                    sucursal,
                    totalSolicitudes: 0,
                    totalHallazgos: 0,
                    promedioErroresPorSolicitud: 0,
                    grupos: todosLosGrupos.map(g => ({ grupo: g, total: 0, porcentaje: 0 })) // inicializar con ceros
                });
            }

            const resumen = sucursalMap.get(sucursal)!;
            resumen.totalSolicitudes += 1;
            totalSolicitudesGlobal += 1;

            for (const evaluacion of prestamo.evaluacionesF1) {
                if (evaluacion.R05Res === 'I') {
                    const grupo = evaluacion.elemento.rubro.grupo.R02Nom;
                    if (grupo === 'Desembolso') continue;

                    // Actualizar sucursal
                    const grupoObj = resumen.grupos.find(g => g.grupo === grupo)!;
                    grupoObj.total += 1;

                    // Totales globales
                    gruposGlobal.set(grupo, (gruposGlobal.get(grupo) ?? 0) + 1);
                    resumen.totalHallazgos += 1;
                    totalHallazgosGlobal += 1;
                }
            }
        }

        // 3️⃣ Calcular porcentajes por sucursal
        for (const resumen of sucursalMap.values()) {
            for (const grupo of resumen.grupos) {
                grupo.porcentaje = resumen.totalHallazgos > 0
                    ? Math.round((grupo.total / resumen.totalHallazgos) * 100)
                    : 0;
            }
            resumen.promedioErroresPorSolicitud = resumen.totalSolicitudes > 0
                ? parseFloat((resumen.totalHallazgos / resumen.totalSolicitudes).toFixed(2))
                : 0;
        }

        // 4️⃣ Calcular totales globales con todos los grupos
        const gruposTotales: GrupoResumenGlobal[] = todosLosGrupos.map(grupo => ({
            grupo,
            total: gruposGlobal.get(grupo) ?? 0,
            porcentaje: totalHallazgosGlobal > 0
                ? Math.round(((gruposGlobal.get(grupo) ?? 0) / totalHallazgosGlobal) * 100)
                : 0
        }));

        return {
            sucursales: Array.from(sucursalMap.values()),
            totales: {
                totalSolicitudes: totalSolicitudesGlobal,
                totalHallazgos: totalHallazgosGlobal,
                promedioErroresPorSolicitud: totalSolicitudesGlobal > 0
                    ? parseFloat((totalHallazgosGlobal / totalSolicitudesGlobal).toFixed(2))
                    : 0,
                grupos: gruposTotales
            }
        };
    }


    async getDetalleAnomaliasPorEjecutivo(
        input: FiltroFechasInput,
        user: Usuario
    ): Promise<DetalleAnomaliasEjecutivoF1Response> {
        const { fechaInicio, fechaFinal } = input;

        // 🧩 Obtener todos los rubros y elementos registrados
        const rubros = await this.r03Rubro.findMany({
            where: { grupo: { R02Coop_id: user.R12Coop_id } },
            include: {
                elementos: {
                    select: { R04Nom: true, R04Imp: true },
                },
                grupo: true,
            },
        });

        // 🧩 Inicializar mapa de rubros base
        const rubrosBaseMap = new Map<string, Map<string, string>>(); // rubro -> (elemento -> impacto)

        for (const r of rubros) {
            if (!rubrosBaseMap.has(r.R03Nom)) {
                rubrosBaseMap.set(r.R03Nom, new Map());
            }
            for (const e of r.elementos) {
                rubrosBaseMap.get(r.R03Nom)!.set(e.R04Nom, e.R04Imp);
            }
        }

        // 🧩 Obtener préstamos con errores (evaluaciones "I")
        const solicitudes = await this.r01Prestamo.findMany({
            where: {
                R01Est: 'Sin seguimiento',
                R01FRec: {
                    gte: new Date(fechaInicio).toISOString(),
                    lte: new Date(fechaFinal).toISOString(),
                },
                R01Coop_id: user.R12Coop_id,
                resumenF1: { R06Res: Resolucion.PASA_COMITE },
            },
            include: {
                sucursal: true,
                ejecutivo: {
                    select: { R12Id: true, R12Ni: true, R12Nom: true },
                },
                evaluacionesF1: {
                    where: { R05Res: 'I' },
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
            },
        });

        // 🧩 Agregar rubros/elementos faltantes
        for (const solicitud of solicitudes) {
            for (const ev of solicitud.evaluacionesF1) {
                const rubroNombre = ev.elemento?.rubro?.R03Nom;
                const elementoNombre = ev.elemento?.R04Nom;
                const impacto = ev.elemento?.R04Imp ?? 'BAJO';

                if (!rubroNombre || !elementoNombre) continue;

                if (!rubrosBaseMap.has(rubroNombre)) {
                    rubrosBaseMap.set(rubroNombre, new Map());
                }
                const elementos = rubrosBaseMap.get(rubroNombre)!;
                if (!elementos.has(elementoNombre)) {
                    elementos.set(elementoNombre, impacto);
                }
            }
        }

        // 🧩 Construcción de rubros base como arreglo
        const rubrosBase = Array.from(rubrosBaseMap.entries()).map(([rubro, elementosMap]) => ({
            rubro,
            elementos: Array.from(elementosMap.entries()).map(([elemento, impacto]) => ({
                elemento,
                impacto,
            })),
        }));

        // 🧠 Mapa final por ejecutivo
        let totalErroresGlobales = 0;
        const ejecutivosMap = new Map<string, EjecutivoDetalle>();

        for (const solicitud of solicitudes) {
            const usuarioId = solicitud.ejecutivo?.R12Id;
            if (!usuarioId) continue;

            if (!ejecutivosMap.has(usuarioId)) {
                ejecutivosMap.set(usuarioId, {
                    usuario: solicitud.ejecutivo.R12Ni,
                    nombre: solicitud.ejecutivo.R12Nom,
                    sucursal: solicitud.sucursal?.R11Nom ?? 'Desconocida',
                    totalSolicitudes: 0,
                    rubros: [],
                    totalErrores: 0,
                });
            }

            const ejecutivo = ejecutivosMap.get(usuarioId)!;
            ejecutivo.totalSolicitudes++;

            // Inicializa rubros si es la primera vez
            if (ejecutivo.rubros.length === 0) {
                ejecutivo.rubros = rubrosBase.map(rb => ({
                    rubro: rb.rubro,
                    elementos: rb.elementos.map(e => ({
                        elemento: e.elemento,
                        impacto: e.impacto,
                        total: 0,
                    })),
                }));
            }

            // Acumular errores en rubros
            for (const ev of solicitud.evaluacionesF1) {
                const rubroNombre = ev.elemento?.rubro?.R03Nom;
                const elementoNombre = ev.elemento?.R04Nom;

                if (!rubroNombre || !elementoNombre) continue;

                const rubro = ejecutivo.rubros.find(r => r.rubro === rubroNombre);
                if (!rubro) continue;

                const elemento = rubro.elementos.find(e => e.elemento === elementoNombre);
                if (!elemento) continue;

                elemento.total++;
                ejecutivo.totalErrores++;
                totalErroresGlobales++;
            }
        }

        // 🧩 Construcción de totales globales por rubro
        const totalesMap = new Map<string, Map<string, { total: number; impacto: string }>>();

        for (const ejecutivo of ejecutivosMap.values()) {
            for (const rubro of ejecutivo.rubros) {
                if (!totalesMap.has(rubro.rubro)) {
                    totalesMap.set(rubro.rubro, new Map());
                }
                const elMap = totalesMap.get(rubro.rubro)!;

                for (const el of rubro.elementos) {
                    if (!elMap.has(el.elemento)) {
                        elMap.set(el.elemento, { total: 0, impacto: el.impacto });
                    }
                    elMap.set(el.elemento, {
                        total: elMap.get(el.elemento)!.total + el.total,
                        impacto: el.impacto,
                    });
                }
            }
        }

        const totales: TotalesColumnasDetalle = {
            rubros: Array.from(totalesMap.entries()).map(([rubro, elMap]) => ({
                rubro,
                elementos: Array.from(elMap.entries()).map(([elemento, data]) => ({
                    elemento,
                    impacto: data.impacto,
                    total: data.total,
                })),
            })),
            totalErroresGlobales,
        };

        return {
            ejecutivos: Array.from(ejecutivosMap.values()),
            totales,
        };
    }

    async getDetalleAnomaliasIntegralPorEjecutivos(
        input: FiltroFechasInput,
        user: Usuario
    ): Promise<DetalleAnomaliasIntegralEjecutivosResponseF1> {

        const { fechaInicio, fechaFinal } = input;

        const prestamos = await this.r01Prestamo.findMany({
            where: {
                R01FRec: {
                    gte: new Date(fechaInicio).toISOString(),
                    lte: new Date(fechaFinal).toISOString(),
                },
                R01Coop_id: user.R12Coop_id,
                R01Est: 'Sin seguimiento',
                R01Activ: true,
                resumenF1: {
                    R06Res: Resolucion.PASA_COMITE,
                },
            },
            include: {
                ejecutivo: {
                    include: {
                        sucursal: true, // para el nombre de sucursal del ejecutivo
                    },
                },
                sucursal: true, // por si no hay sucursal en ejecutivo, usamos la del préstamo
                evaluacionesF1: {
                    include: {
                        elemento: {
                            include: {
                                rubro: {
                                    include: {
                                        grupo: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const ejecutivoMap = new Map<string, AnomaliasEjecutivoResumen>();
        const gruposGlobal = new Map<string, number>();

        let totalSolicitudesGlobal = 0;
        let totalHallazgosGlobal = 0;

        // 1️⃣ Obtener lista global de todos los grupos (sin "Desembolso")
        const todosLosGruposSet = new Set<string>();
        for (const prestamo of prestamos) {
            for (const evaluacion of prestamo.evaluacionesF1 ?? []) {
                const grupo = evaluacion.elemento?.rubro?.grupo?.R02Nom;
                if (grupo && grupo !== 'Desembolso') {
                    todosLosGruposSet.add(grupo);
                }
            }
        }
        const todosLosGrupos = Array.from(todosLosGruposSet).sort();

        // 2️⃣ Recorrer prestamos y agrupar por ejecutivo, inicializando todos los grupos con 0
        for (const prestamo of prestamos) {
            const usuario = prestamo.ejecutivo?.R12Ni ?? 'SIN_USUARIO';
            const nombre = prestamo.ejecutivo?.R12Nom ?? 'Sin nombre';
            // preferimos la sucursal del ejecutivo, si no existe usamos la del préstamo
            const sucursal = prestamo.ejecutivo?.sucursal?.R11Nom ?? prestamo.sucursal?.R11Nom ?? 'Sin sucursal';

            if (!ejecutivoMap.has(usuario)) {
                ejecutivoMap.set(usuario, {
                    usuario,
                    nombre,
                    sucursal,
                    totalSolicitudes: 0,
                    totalHallazgos: 0,
                    promedioErroresPorSolicitud: 0,
                    grupos: todosLosGrupos.map(g => ({ grupo: g, total: 0, porcentaje: 0 })),
                });
            }

            const resumen = ejecutivoMap.get(usuario)!;
            resumen.totalSolicitudes += 1;
            totalSolicitudesGlobal += 1;

            // contar por grupo dentro del préstamo
            for (const evaluacion of prestamo.evaluacionesF1 ?? []) {
                if (evaluacion.R05Res === 'I') {
                    const grupo = evaluacion.elemento?.rubro?.grupo?.R02Nom;
                    if (!grupo || grupo === 'Desembolso') continue;

                    // actualizar el grupo dentro del ejecutivo (ya inicializado)
                    const grupoObj = resumen.grupos.find(g => g.grupo === grupo)!;
                    grupoObj.total += 1;

                    // actualizar globales
                    gruposGlobal.set(grupo, (gruposGlobal.get(grupo) ?? 0) + 1);
                    resumen.totalHallazgos += 1;
                    totalHallazgosGlobal += 1;
                }
            }
        }

        // 3️⃣ Calcular porcentajes por ejecutivo y promedio errores/solicitud
        for (const resumen of ejecutivoMap.values()) {
            for (const grupo of resumen.grupos) {
                grupo.porcentaje = resumen.totalHallazgos > 0
                    ? Math.round((grupo.total / resumen.totalHallazgos) * 100)
                    : 0;
            }
            resumen.promedioErroresPorSolicitud = resumen.totalSolicitudes > 0
                ? parseFloat((resumen.totalHallazgos / resumen.totalSolicitudes).toFixed(2))
                : 0;
        }

        // 4️⃣ Construir grupos globales asegurando todos los grupos (incluso con 0)
        const gruposTotales: GrupoResumenGlobal[] = todosLosGrupos.map(grupo => ({
            grupo,
            total: gruposGlobal.get(grupo) ?? 0,
            porcentaje: totalHallazgosGlobal > 0
                ? Math.round(((gruposGlobal.get(grupo) ?? 0) / totalHallazgosGlobal) * 100)
                : 0,
        }));

        return {
            ejecutivos: Array.from(ejecutivoMap.values()),
            totales: {
                totalSolicitudes: totalSolicitudesGlobal,
                totalHallazgos: totalHallazgosGlobal,
                promedioErroresPorSolicitud: totalSolicitudesGlobal > 0
                    ? parseFloat((totalHallazgosGlobal / totalSolicitudesGlobal).toFixed(2))
                    : 0,
                grupos: gruposTotales,
            },
        };
    }


}
