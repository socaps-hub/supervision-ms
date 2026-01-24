import { Controller, UseInterceptors } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreditoService } from "./credito.service";
import { Usuario } from "src/common/entities/usuario.entity";
import { CreateMuestraSeleccionInput } from "./dto/inputs/muestra-seleccion/create-muestra-seleccion.input";
import { GetCreditosSeleccionadosInput } from "./dto/inputs/muestra-credito-seleccion/get-creditos-seleccionados.input";
import { ParametrosMuestraExtendInput } from "./dto/inputs/muestra-params-extend.input";
import { ValidEstadosAuditoria } from "../enums/valid-estados.enum";
import { InventarioRevisionFilterInput } from "./dto/inputs/inventario-revision-filter.input";
import { ActivityLog } from "src/common/decorators/activity-log.decorator";
import { AuditActionEnum } from "src/common/enums/audit-action.enum";
import { ActivityLogRpcInterceptor } from "src/common/interceptor/activity-log-rpc.interceptor";

@Controller()
export class CreditoHandler {
  constructor(private readonly _service: CreditoService) {}

  @MessagePattern('supervision.auditoria.credito.getCreditoSeleccionadoById')
  handleGetCreditoSeleccionadoById( 
    @Payload() {id}: { id: number }
  ) {
    return this._service.getCreditoSeleccionadoById( id )
  }

  // * CALCULO DE UNIVERSO Y MUESTRA
  // ────────────────────────────────────────────────
  // 🔹 1️⃣ Cálculo inicial (valores absolutos)
  // ────────────────────────────────────────────────
  @MessagePattern('supervision.auditoria.credito.getMuestraInicial')
  async handleGetMuestraInicial(
    @Payload() { input, user }: { input: ParametrosMuestraExtendInput; user: Usuario },
  ) {
    return this._service.getMuestraInicial(input, user);
  }

  // ────────────────────────────────────────────────
  // 🔹 2️⃣ Créditos filtrados (tabla dinámica)
  // ────────────────────────────────────────────────
  @MessagePattern('supervision.auditoria.credito.getCreditosFiltrados')
  async handleGetCreditosFiltrados(
    @Payload() { input, user }: { input: ParametrosMuestraExtendInput; user: Usuario },
  ) {
    return this._service.getCreditosFiltrados(input, user);
  }

  // * GUARDADO DE MUESTRA (SELECCION)
  @UseInterceptors(ActivityLogRpcInterceptor)
  @ActivityLog({  
    service: 'supervision-ms',
    module: 'auditoria-credito',
    action: AuditActionEnum.EXECUTE,
    eventName: 'supervision.auditoria.credito.muestra.upsert',
    entities: [
      { name: 'A01MuestraSeleccionCredito', idPath: 'muestraId' },
    ],
  })
  @MessagePattern('supervision.auditoria.credito.createOrUpdateMuestraSeleccion')
  async handleCrearMuestraSeleccion(
    @Payload() { user, input, folios, isUpdate, muestraId }: {
      user: Usuario;
      input: CreateMuestraSeleccionInput;
      folios: number[];
      isUpdate: boolean;
      muestraId?: number;
    },
  ) {
    return this._service.upsertMuestraSeleccionConFolios(
      user,
      input,
      folios,
      isUpdate,
      muestraId,
    );
  }

  // * CONSULTA DE MUESTRAS (INVENTARIO)
  // ────────────────────────────────────────────────
  @MessagePattern('supervision.auditoria.credito.getAllMuestras')
  async handleGetAllMuestras(
    @Payload() { user, page = 1, pageSize = 20, paginado = false }: { user: Usuario; page?: number; pageSize?: number; paginado?: boolean },
  ) {
    return this._service.getAllMuestrasSeleccion(user, page, pageSize, paginado);
  }

  @MessagePattern('supervision.auditoria.credito.getCreditosSeleccionadosByMuestra')
  async handleGetCreditosSeleccionadosByMuestra(
    @Payload() { user, input }: { user: Usuario; input: GetCreditosSeleccionadosInput },
  ) {
    return this._service.getCreditosSeleccionadosByMuestra(user, input)
  }

  @MessagePattern('supervision.auditoria.credito.getMuestraDetalleById')
  async handleGetMuestraDetalleById(
    @Payload() { muestraId }: { muestraId: number },
  ) {
    return this._service.getMuestraDetalleById(muestraId)
  }

  // * INVENTARIO DE REVISION
  @MessagePattern('supervision.auditoria.credito.getByEstado')
  async handleGetCreditosByEstado(
    @Payload() { estado, user, filterBySucursal }: { estado: ValidEstadosAuditoria; user: Usuario, filterBySucursal: boolean },
  ) {
    return this._service.findByEstado( estado, user, filterBySucursal );
  }

  @MessagePattern('supervision.auditoria.credito.getInventarioExpedientesFiltrado')
  async handleGetInventarioExpedientesFiltrado(
    @Payload() { input, user }: { input: InventarioRevisionFilterInput, user: Usuario },
  ) {
    return this._service.getInventarioExpedientesFiltrado( input, user );
  }

  @MessagePattern('supervision.auditoria.credito.getInventarioRevisionStats')
  async handleGetInventarioRevisionStats(
    @Payload() { input, user }: { input: InventarioRevisionFilterInput, user: Usuario },
  ) {
    return this._service.getInventarioRevisionStats( input, user );
  }
  
  @MessagePattern('supervision.auditoria.credito.getInventarioSeguimientoStats')
  async handleGetInventarioSeguimientoStats(
    @Payload() { input, user }: { input: InventarioRevisionFilterInput, user: Usuario },
  ) {
    return this._service.getInventarioSeguimientoStats( input, user );
  }

}
