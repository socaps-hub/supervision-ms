import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RubrosService } from './rubros.service';
import { CreateRubroInput } from './dto/create-rubro.input';
import { UpdateRubroInput } from './dto/update-rubro.input';
import { CreateManyRubrosFromExcelDto } from './dto/create-many-rubros-from-excel.dto';

@Controller()
export class RubrosHandler {

  constructor(
    private readonly rubrosService: RubrosService
  ) { }

  @MessagePattern('supervision.rubros.create')
  handleCreate(
    @Payload() createRubroInput: CreateRubroInput
  ) {
    return this.rubrosService.create(createRubroInput);
  }

  @MessagePattern('supervision.rubros.getAll')
  handleGetAll(
    @Payload('coopId') coopId: string
  ) {
    return this.rubrosService.findAll(coopId);
  }

  @MessagePattern('supervision.rubros.getById')
  handleFindById(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.rubrosService.findById(id);
  }

  @MessagePattern('supervision.rubros.update')
  handleUpdate(
    @Payload('updateRubroInput') updateRubroInput: UpdateRubroInput
  ) {
    return this.rubrosService.update(updateRubroInput.id, updateRubroInput);
  }

  @MessagePattern('supervision.rubros.remove')
  handleRemove(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.rubrosService.remove(id);
  }

  @MessagePattern('supervision.rubros.createManyFromExcel')
  handleCreateManyFromExcel(
    @Payload() { data, coopId }: { data: CreateManyRubrosFromExcelDto[], coopId: string }
  ) {
    return this.rubrosService.createManyFromExcel( data, coopId )
  }

}
