import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { BalanceResponse } from "../dto/balance/balance-response.output";
import { Usuario } from "src/common/entities/usuario.entity";

@Injectable()
export class BalanceService extends PrismaClient implements OnModuleInit {

    private readonly _logger = new Logger('Sisconcap - BalanceService')

    async onModuleInit() {
        await this.$connect();
        this._logger.log('Database connected')
    }

    async getBalance(user: Usuario): Promise<BalanceResponse> {
        // === FASE 1 ===
        const fase1 = await this.r21EvaluacionResumenFase1.findMany({
            where: { movimiento: { R19Coop_id: user.R12Coop_id } },
            select: { R21Folio: true, R21Ha: true },
        });

        // === FASE 2 ===
        const fase2 = await this.r23EvaluacionResumenFase2.findMany({
            where: { movimiento: { R19Coop_id: user.R12Coop_id } },
            select: { R23Folio: true, R23PSolv: true },
        });

        // === FASE 3 ===
        const fase3 = await this.r25EvaluacionResumenFase3.findMany({
            where: { movimiento: { R19Coop_id: user.R12Coop_id } },
            select: { R25Folio: true, R25PSolv: true },
        });

        // ===============================
        // Totales globales por fase
        // ===============================

        // Movimientos por fase
        const totalMovF1 = fase1.length;
        const totalMovF2 = fase2.length;
        const totalMovF3 = fase3.length;

        // Anomalías por fase
        const totalAnomF1 = fase1.reduce((sum, x) => sum + (x.R21Ha ?? 0), 0);
        const totalAnomF2 = fase2.reduce((sum, x) => sum + (x.R23PSolv ?? 0), 0);
        const totalAnomF3 = fase3.reduce((sum, x) => sum + (x.R25PSolv ?? 0), 0);

        // ===============================
        // Cálculo del balance
        // ===============================

        const movimientosF1 = totalMovF1 - totalMovF2;
        const anomaliasF1 = totalAnomF1 - totalAnomF2;

        const movimientosF2 = totalMovF2 - totalMovF3;
        const anomaliasF2 = totalAnomF2 - totalAnomF3;

        const movimientosF3 = totalMovF3;
        const anomaliasF3 = totalAnomF3;

        // ===============================
        // Respuesta final
        // ===============================

        return {
            movimientosF1,
            anomaliasF1,
            movimientosF2,
            anomaliasF2,
            movimientosF3,
            anomaliasF3,
        };
    }


}