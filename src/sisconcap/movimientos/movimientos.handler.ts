import { Controller, Logger } from "@nestjs/common";
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

@Controller()
export class MovimientosHandler {
    private readonly logger = new Logger('Movimientos Handler');

    constructor(
        private readonly _movimientosService: MovimientosService,
    ) { }

    @MessagePattern('supervision.movimientos.createFase1')
    async handleCreateFase1(
        @Payload() { input, user }: { input: CreateFase1Input, user: Usuario }
    ): Promise<BooleanResponse> {
        console.log('llamado');
        
        try {
            await this._movimientosService.createFase1(
                input.movimiento,
                input.evaluaciones,
                input.resumen,
                user,
            );

            return {
                success: true,
                message: 'Fase 1 creada exitosamente',
            };
        } catch (error) {
            this.logger.error('❌ Error en MovimientosHandler.handleCreateFase1', error);

            return {
                success: false,
                message: error?.message || 'No se pudo crear la Fase 1',
            };
        }
    }

    @MessagePattern('supervision.movimientos.createOrUpdateFase2')
    async handleCreateOrUpdateFase2(
        @Payload() { input, user }: { input: CreateFase2Input, user: Usuario }
    ) {
        return await this._movimientosService.createOrUpdateFase2( input, user );
    }  

    @MessagePattern('supervision.movimientos.createOrUpdateFase3')
    async handleCreateOrUpdateFase3(
        @Payload() { input, user }: { input: CreateFase3Input, user: Usuario }
    ) {
        return await this._movimientosService.createOrUpdateFase3( input, user );
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

    @MessagePattern('supervision.movimientos.updateFase1')
    async handleUpdateFase1(
        @Payload() { input, user }: { input: UpdateMovimientoArgs, user: Usuario }
    ): Promise<BooleanResponse> {
        return await this._movimientosService.updateFase1( input, user );
    }    

    @MessagePattern('supervision.movimientos.remove')
    handleRemove(
        @Payload() { folio, user }: { folio: number, user: Usuario }
    ) {
        return this._movimientosService.remove( folio, user );
    }    

    @MessagePattern('supervision.movimientos.cancelFase3AndFase2')
    async handleCancelFase3AndFase2(
        @Payload() { folio, user }: { folio: number, user: Usuario }
    ) {
        return await this._movimientosService.cancelFase3AndFase2( folio, user );
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
