import { Controller, Logger, UseInterceptors } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { MovimientosService } from "./movimientos.service";
import { CreateFase1Input } from "./dto/inputs/create-fase1.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { BooleanResponse } from "src/common/dto/boolean-response.object";
import { UpdateMovimientoArgs } from "./dto/inputs/update-movimiento.input";
import { CreateFase2Input } from "./dto/inputs/create-fase2.input";
import { CreateFase3Input } from "./dto/inputs/create-fase3.input";
import { InventarioSolicitudesFilterInput } from "src/sisconcre/solicitudes/dto/inputs/solicitudes/inventario-solicitudes-filter.input";
import { ValidEstados } from "src/sisconcre/solicitudes/enums/valid-estados.enum";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";

@Controller()
export class MovimientosHandler {
    private readonly logger = new Logger('Movimientos Handler');

    constructor(
        private readonly _movimientosService: MovimientosService,
    ) { }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.movimientos.createFase1',
        entities: [
            { name: 'R19Movimientos', idPath: 'movimientoId' },
            { name: 'R20EvaluacionFase1', idPath: 'evaluacionId' },
            { name: 'R21EvaluacionResumenFase1', idPath: 'resumenId' },
        ],
    })
    @MessagePattern('supervision.movimientos.createFase1')
    async handleCreateFase1(
        @Payload() { input, user }: { input: CreateFase1Input, user: Usuario }
    ): Promise<BooleanResponse> {
        try {
            const result = await this._movimientosService.createFase1(
                input.movimiento,
                input.evaluaciones,
                input.resumen,
                user,
            );

            this.logger.log('Fase 1 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Fase 1 creada exitosamente',
                ...result
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleCreateFase1', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 1',
            };
        }
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.movimientos.createOrUpdateFase2',
        entities: [
            { name: 'R19Movimientos', idPath: 'movimientoId' },
            { name: 'R22EvaluacionFase2', idPath: 'movimientoId' },
            { name: 'R23EvaluacionResumenFase2', idPath: 'movimientoId' },
        ],
    })
    @MessagePattern('supervision.movimientos.createOrUpdateFase2')
    async handleCreateOrUpdateFase2(
        @Payload() { input, user }: { input: CreateFase2Input, user: Usuario }
    ) {
        try {
            const result = await this._movimientosService.createOrUpdateFase2( input, user )

            this.logger.log('Fase 2 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Seguimiento realizado exitosamente.',
                ...result
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleCreateOrUpdateFase2', error);

            return {
                success: false,
                message: error?.message || 'No se pudo realizar el Seguimiento.',
            };
        }
    }  

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.CREATE,
        eventName: 'supervision.movimientos.createOrUpdateFase3',
        entities: [
            { name: 'R19Movimientos', idPath: 'movimientoId' },
            { name: 'R24EvaluacionFase3Sisconcap', idPath: 'movimientoId' },
            { name: 'R25EvaluacionResumenFase3', idPath: 'movimientoId' },
        ],
    })
    @MessagePattern('supervision.movimientos.createOrUpdateFase3')
    async handleCreateOrUpdateFase3(
        @Payload() { input, user }: { input: CreateFase3Input, user: Usuario }
    ) {
        try {
            const result = await this._movimientosService.createOrUpdateFase3( input, user )

            this.logger.log('Fase 3 Creada por: ', user.R12Id);
            return {
                success: true,
                message: 'Seguimiento Global realizado exitosamente.',
                ...result
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleCreateOrUpdateFase3', error);

            return {
                success: false,
                message: error?.message || 'No se pudo realizar el Seguimiento Global.',
            };
        }
    }  

    @MessagePattern('supervision.movimientos.getByFolio')
    handleGetByFolio(
        @Payload() { folio, user }: { folio: number, user: Usuario }
    ) {
        return this._movimientosService.findByFolio( folio, user )
    }

    @MessagePattern('supervision.movimientos.getAll')
    handleGetAll(
        @Payload() { user, filterBySucursal }: { user: Usuario, filterBySucursal: boolean }
    ) {
        return this._movimientosService.findAll( user, filterBySucursal )
    }

    @MessagePattern('supervision.movimientos.getInventarioMovimientosFiltrado')
    async handleGetInventarioMovimientosFiltrado(
    @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
    return this._movimientosService.getInventarioMovimientosFiltrado( input, user );
    }

    @MessagePattern('supervision.movimientos.getByEstado')
    handleGetByEstado(
        @Payload() data: { estado: ValidEstados; user: Usuario, filterBySucursal: boolean }
    ) {
        return this._movimientosService.findByEstado(data.estado, data.user, data.filterBySucursal);
    }

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.UPDATE,
        eventName: 'supervision.movimientos.updateFase1',
        entities: [
            { name: 'R19Movimientos', idPath: 'movimientoId' },
            { name: 'R20EvaluacionFase1', idPath: 'movimientoId' },
            { name: 'R21EvaluacionResumenFase1', idPath: 'movimientoId' },
        ],
    })
    @MessagePattern('supervision.movimientos.updateFase1')
    async handleUpdateFase1(
        @Payload() { input, user }: { input: UpdateMovimientoArgs, user: Usuario }
    ): Promise<BooleanResponse> {
        try {
            const result = await this._movimientosService.updateFase1( input, user );

            this.logger.log('Fase 1 actualizada por: ', user.R12Id);
            return {
                success: true,
                message: 'Movimiento actualizado exitosamente',
                ...result
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleUpdateFase1', error);

            return {
                success: false,
                message: error?.message || 'No se pudo actualizar el movimiento.',
            };
        }
    }    

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.DELETE,
        eventName: 'supervision.movimientos.remove',
        entities: [
            { name: 'R19Movimientos', idPath: 'movimientoId' },
        ],
    })
    @MessagePattern('supervision.movimientos.remove')
    async handleRemove(
        @Payload() { folio, user }: { folio: number, user: Usuario }
    ) {
        try {
            const result = await this._movimientosService.remove( folio, user );

            this.logger.log('Movimiento eliminado por: ', user.R12Id);
            return {
                success: true,
                message: `Movimiento ${ folio } eliminado exitosamente.`,
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleRemove', error);

            return {
                success: false,
                message: error?.message || 'No se pudo eliminar el movimiento.',
            };
        }
    }    

    @UseInterceptors(ActivityLogRpcInterceptor)
    @ActivityLog({
        service: 'supervision-ms',
        module: 'movimientos',
        action: AuditActionEnum.DELETE,
        eventName: 'supervision.movimientos.cancelFase3AndFase2',
        entities: [
            { name: 'R24EvaluacionFase3', idPath: 'movimientoId' },
            { name: 'R25EvaluacionResumenFase3', idPath: 'movimientoId' },
            { name: 'R22EvaluacionFase2Sisconcap', idPath: 'movimientoId' },
            { name: 'R23EvaluacionResumenFase2', idPath: 'movimientoId' },
        ],
    })
    @MessagePattern('supervision.movimientos.cancelFase3AndFase2')
    async handleCancelFase3AndFase2(
        @Payload() { folio, user }: { folio: number, user: Usuario }
    ) {
        try {
            const result = await this._movimientosService.cancelFase3AndFase2( folio, user );

            this.logger.log('Fase 3 cancelada por: ', user.R12Id);
            return {
                success: true,
                message: `Fase 3 cancelada exitosamente.`,
                ...result,
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleCancelFase3AndFase2', error);

            return {
                success: false,
                message: error?.message || 'No se pudo cancelar Fase 3.',
            };
        }
    }

    // * STATS
    @MessagePattern('supervision.movimientos.getInventarioF1Stats')
    async handleGetInventarioF1Stats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._movimientosService.getInventarioF1Stats( input, user );
    }

    @MessagePattern('supervision.movimientos.getInventarioF2Stats')
    async handleGetInventarioF2Stats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._movimientosService.getInventarioF2Stats( input, user );
    }

    @MessagePattern('supervision.movimientos.getInventarioF3Stats')
    async handleGetInventarioF3Stats(
        @Payload() { input, user }: { input: InventarioSolicitudesFilterInput, user: Usuario },
    ) {
        return this._movimientosService.getInventarioF3Stats( input, user );
    }

}
