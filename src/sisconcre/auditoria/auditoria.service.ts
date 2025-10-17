import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditoriaInput } from './dto/inputs/auditoria.input';
import { AuditoriaResponse } from './dto/outputs/auditoria-response.output';
import { Usuario } from 'src/common/entities/usuario.entity';

@Injectable()
export class AuditoriaService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('AuditoriaService')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    async validarPrestamosNoExistentes(
        data: AuditoriaInput[],
        user: Usuario,
    ): Promise<AuditoriaResponse[]> {
        // 1️⃣ Obtener todos los números de crédito del Excel
        const numerosExcel = data.map(d => d.numeroCredito);

        // 2️⃣ Consultar en DB solo los que ya existen
        const prestamosExistentes = await this.r01Prestamo.findMany({
            where: { R01NUM: { in: numerosExcel }, R01Coop_id: user.R12Coop_id },
            select: { R01NUM: true },
        });

        const numerosExistentes = new Set(prestamosExistentes.map(p => p.R01NUM));

        // 3️⃣ Filtrar los que no están en DB
        const noExistentes = data.filter(d => !numerosExistentes.has(d.numeroCredito));

        if (noExistentes.length === 0) return [];

        // 4️⃣ Obtener sucursales por número
        const sucNumeros = Array.from(new Set(noExistentes.map(d => d.sucursal)));
        const sucursales = await this.r11Sucursal.findMany({
            where: { R11NumSuc: { in: sucNumeros }, R11Coop_id: user.R12Coop_id },
            select: { R11NumSuc: true, R11Nom: true },
        });
        const mapSuc = new Map(sucursales.map(s => [s.R11NumSuc, s.R11Nom]));

        // 5️⃣ Obtener ejecutivos por usuario (Usr. Solicitud)
        const usrNis = Array.from(new Set(noExistentes.map(d => d.usrSolicitud)));
        const usuarios = await this.r12Usuario.findMany({
            where: { R12Ni: { in: usrNis }, R12Coop_id: user.R12Coop_id },
            select: { R12Ni: true, R12Nom: true },
        });
        const mapUsr = new Map(usuarios.map(u => [u.R12Ni, u.R12Nom]));

        // 6️⃣ Construir respuesta enriquecida
        return noExistentes.map(d => ({
            prestamo: d.numeroCredito,
            sucursal: mapSuc.get(d.sucursal) ?? 'Desconocida',
            cag: d.numeroCag,
            socio: d.nombre,
            importe: +d.cantidadEntregada,
            entrega: d.fechaEntrega,
            usuario: d.usrAutorizacion,
            ejecutivo: mapUsr.get(d.usrSolicitud) ?? 'No encontrado',
            categoria: d.tipo,
            producto: d.categoria,
        }));
    }


}
