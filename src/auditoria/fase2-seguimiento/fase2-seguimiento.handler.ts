import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "src/common/entities/usuario.entity";
import { Fase2SeguimientoService } from "./fase2-seguimiento.service";
import { CreateFase2SeguimientoInput } from "./dto/inputs/credito/create-fase2-seguimiento.input";

@Controller()
export class Fase2SeguimientoHandler {

  constructor(private readonly _service: Fase2SeguimientoService) {}

  @MessagePattern('supervision.auditoria.fase2.handleCreateOrUpdateFase2')
  handleCreateOrUpdateFase1(
    @Payload() { input, user }: { input: CreateFase2SeguimientoInput, user: Usuario }
  ) {
    return this._service.createOrUpdateFase2( input, user )
  }

}