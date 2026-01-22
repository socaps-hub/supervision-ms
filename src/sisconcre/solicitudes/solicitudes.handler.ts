import { Controller, Logger, UseInterceptors } from "@nestjs/common";
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
import { SisConCreCreateFase3Input } from "./dto/inputs/fase3-desembolso/create-fase3.input";
import { SisConCreCreateFase4Input } from "./dto/inputs/fase4-seguimiento-global/create-or-update-fase4.input";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";

@Controller()
export class SolicitudesHandler {
    private readonly logger = new Logger('Solicitudes Handler');

    constructor(
        private readonly _service: SolicitudesService,
    ) { }

    // * FASES ACTIONS
    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.solicitudes.createFase1',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
            { name: 'R05EvaluacionFase1', idPath: 'evaluacionId' },
            { name: 'R06EvaluacionResumenFase1', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.createFase1')
    async handleCreateFase1(
        @Payload() { input, user }: { input: SisConCreCreateFase1Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            const result = await this._service.createFase1(input, user);

            this.logger.log('Fase 1 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 1 creada exitosamente',
                ...result
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateFase1', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 1',
            };
        }

    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.UPDATE,
        eventName: 'supervision.solicitudes.updateAll',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
            { name: 'R05EvaluacionFase1', idPath: 'evaluacionId' },
            { name: 'R06EvaluacionResumenFase1', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.updateAll')
    async handleUpdateF1(
        @Payload() { input, user }: { input: UpdateAllPrestamoArgs, user: Usuario}
    ) {
        this.logger.log('Fase 1 Actualizada por: ', user.R12Id);
        return await this._service.updateAll( input, user );
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.solicitudes.createOrUpdateFase2',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
            { name: 'R07EvaluacionFase2', idPath: 'evaluacionId' },
            { name: 'R08EvaluacionResumenFase2', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.createOrUpdateFase2')
    async handleCreateOrUpdateFase2(
        @Payload() { input, user }: { input: SisConCreCreateFase2Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            const result = await this._service.createOrUpdateFase2(input, user);

            this.logger.log('Fase 2 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 2 creada exitosamente',
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateOrUpdateFase2', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 2',
            };
        }

    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.solicitudes.createOrUpdateFase3',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
            { name: 'R09EvaluacionFase3', idPath: 'evaluacionId' },
            { name: 'R10EvaluacionResumenFase3', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.createOrUpdateFase3')
    async handleCreateOrUpdateFase3(
        @Payload() { input, user }: { input: SisConCreCreateFase3Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            const result = await this._service.createOrUpdateFase3(input, user);

            this.logger.log('Fase 3 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 3 creada exitosamente',
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateOrUpdateFase3', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 3',
            };
        }

    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.solicitudes.createOrUpdateFase4',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
            { name: 'R15EvaluacionFase4', idPath: 'evaluacionId' },
            { name: 'R16EvaluacionResumenFase4', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.createOrUpdateFase4')
    async handleCreateOrUpdateFase4(
        @Payload() { input, user }: { input: SisConCreCreateFase4Input, user: Usuario }
    ): Promise<BooleanResponse> {

        try {
            const result = await this._service.createOrUpdateFase4(input, user);

            this.logger.log('Fase 4 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 4 creada exitosamente',
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleCreateOrUpdateFase4', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 4',
            };
        }

    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.EXECUTE,
        eventName: 'supervision.solicitudes.pasoMasivoAFase4',
        entities: [
            {
                name: 'R01Prestamo',
                idPath: 'prestamoIds', // 👈 array
            },
        ],
    })
    @MessagePattern('supervision.solicitudes.pasoMasivoAFase4')
    async handlePasoMasivoAFase4(
        @Payload() {user}:{user: Usuario}
    ) {
        return this._service.pasoMasivoAFase4( user );
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

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'solicitudes',
        action: AuditActionEnum.DELETE,
        eventName: 'supervision.solicitudes.remove',
        entities: [
            { name: 'R01Prestamo', idPath: 'prestamoId' },
        ],
    })
    @MessagePattern('supervision.solicitudes.remove')
    async handleRemove(
        @Payload() { id, user }: { id: string, user: Usuario }
    ) {
        try {
            const result = await this._service.remove(id, user);

            this.logger.log('Solicitud eliminada por: ', user.R12Id);
            return {
                success: true,
                message: `Solicitud ${ id } eliminada exitosamente`,
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en SolicitudesHandler.handleRemove', error);

            return {
                success: false,
                message: error?.message || 'No se pudo eliminar la solicitud',
            };
        }
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