import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { SolicitudesService } from "./solicitudes.service";
import { SisConCreCreateFase1Input } from "./dto/inputs/fase1-levantamiento/create-fase1.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { BooleanResponse } from "src/common/dto/boolean-response.object";
import { CreateResumenFase1Input } from "./dto/inputs/fase1-levantamiento/resumen/create-resumen-fase1.input";
import { ValidEstados } from "./enums/valid-estados.enum";
import { InventarioSolicitudesFilterInput } from "./dto/inputs/solicitudes/inventario-solicitudes-filter.input";
import { UpdatePrestamoInput } from "./dto/inputs/solicitudes/update-solicitud.input";
import { UpdateAllPrestamoArgs } from "./dto/args/update-all-prestamo.arg";
import { SisConCreCreateFase2Input } from "./dto/inputs/fase2-seguimiento/create-fase2input";

@Controller()
export class SolicitudesHandler {
    private readonly logger = new Logger('Solicitudes Handler');

    // *TODO -> Eliminar fase-i-levantamiento y solucionar posibles errores
    constructor(
        private readonly _service: SolicitudesService,
    ) { }

    // * FASES ACTIONS
    @MessagePattern('supervision.solicitudes.createFase1')
    async handleCreateFase1(
        @Payload() { input, user }: { input: SisConCreCreateFase1Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            await this._service.createFase1(input, user);

            this.logger.error('Fase 1 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 1 creada exitosamente',
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateFase1', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 1',
            };
        }

    }

    @MessagePattern('supervision.solicitudes.updateAll')
    async handleUpdateF1(
        @Payload() { input, user }: { input: UpdateAllPrestamoArgs, user: Usuario}
    ) {
        this.logger.error('Fase 1 Actualizada por: ', user.R12Id);
        return await this._service.updateAll( input, user );
    }

    @MessagePattern('supervision.solicitudes.createOrUpdateFase2')
    async handleCreateOrUpdateFase2(
        @Payload() { input, user }: { input: SisConCreCreateFase2Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            await this._service.createOrUpdateFase2(input, user);

            this.logger.error('Fase 2 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 2 creada exitosamente',
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateOrUpdateFase2', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 2',
            };
        }

    }

    @MessagePattern('supervision.solicitudes.getInventarioSolicitudesFiltrado')
    async handleGetInventarioSolicitudesFiltrado(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._service.getInventarioSolicitudesFiltrado(input, user);
    }

    @MessagePattern('supervision.solicitudes.getById')
    handleGetById(
        @Payload() data: { id: string, user: Usuario }
    ) {
        return this._service.findById(data.id, data.user);
    }

    @MessagePattern('supervision.solicitudes.getByEstado')
    handleGetByEstado(
        @Payload() data: { estado: ValidEstados; user: Usuario, filterBySucursal: boolean }
    ) {
        return this._service.findByEstado(data.estado, data.user, data.filterBySucursal);
    }

    @MessagePattern('supervision.solicitudes.update')
    handleUpdate(
        @Payload() data: { updatePrestamoInput: UpdatePrestamoInput, user: Usuario }
    ) {
        return this._service.update(data.updatePrestamoInput.id, data.updatePrestamoInput, data.user);
    }    

    @MessagePattern('supervision.solicitudes.remove')
    handleRemove(
        @Payload() data: { id: string, user: Usuario }
    ) {
        return this._service.remove(data.id, data.user);
    }

    // * STATS
    @MessagePattern('supervision.solicitudes.getInventarioSolicitudesStats')
    async handleGetSolicitudesRevisionStats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._service.getInventarioSolicitudesStats(input, user);
    }

    @MessagePattern('supervision.solicitudes.getInventarioSeguimientosStats')
    async handleGetInventarioSeguimientosStats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._service.getInventarioSeguimientosStats(input, user);
    }

    @MessagePattern('supervision.solicitudes.getInventarioDesembolsosStats')
    async handleGetInventarioDesembolsosStats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._service.getInventarioDesembolsosStats(input, user);
    }

    @MessagePattern('supervision.solicitudes.getInventarioSeguimientoGlobalStats')
    async handleGetInventarioSeguimientoGlobalStats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._service.getInventarioSeguimientoGlobalStats(input, user);
    }


}