import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { MovimientosService } from "./movimientos.service";
import { CreateFase1Input } from "./dto/inputs/create-fase1.input";
import { Usuario } from "src/common/entities/usuario.entity";
import { BooleanResponse } from "src/common/dto/boolean-response.object";
import { UpdateMovimientoArgs } from "./dto/inputs/update-movimiento.input";

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

}
