import { Controller } from "@nestjs/common";
import { Fase1RevisionService } from "./fase1-revision.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Usuario } from "src/common/entities/usuario.entity";
import { CreateFase1RevisionInput } from "./dto/inputs/credito/create-fase1-revision.input";

@Controller()
export class Fase1RevisionHandler {

  constructor(private readonly _service: Fase1RevisionService) {}

  @MessagePattern('supervision.auditoria.fase1.handleCreateOrUpdateFase1')
  handleCreateOrUpdateFase1(
    @Payload() { input, user }: { input: CreateFase1RevisionInput, user: Usuario }
  ) {
    return this._service.createOrUpdateFase1( input, user )
  }

}