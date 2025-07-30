import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ElementosService } from './elementos.service';
import { CreateElementoInput } from './dto/create-elemento.input';
import { UpdateElementoInput } from './dto/update-elemento.input';
import { CreateManyElementoFromExcelDto } from './dto/create-many-elementos-from-excel.dto';

@Controller()
export class ElementosHandler {

  constructor(
    private readonly elementosService: ElementosService
  ) { }

  @MessagePattern('supervision.elementos.create')
  handleCreate(
    @Payload('createElementoInput') createElementoInput: CreateElementoInput
  ) {
    return this.elementosService.create(createElementoInput);
  }

  @MessagePattern('supervision.elementos.getAll')
  handleFindAll(
    @Payload('rubroId', ParseUUIDPipe) rubroId: string
  ) {
    return this.elementosService.findAll(rubroId);
  }

  @MessagePattern('supervision.elementos.getById')
  handleFindById(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.elementosService.findById(id);
  }

  @MessagePattern('supervision.elementos.update')
  handleUpdate(
    @Payload('updateElementoInput') updateElementoInput: UpdateElementoInput
  ) {
    return this.elementosService.update(updateElementoInput.id, updateElementoInput);
  }

  @MessagePattern('supervision.elementos.remove')
  handleRemove(
    @Payload('id', ParseUUIDPipe) id: string
  ) {
    return this.elementosService.remove(id);
  }

  @MessagePattern('supervision.elementos.createManyFromExcel')
  handleCreateManyFromExcel(
    @Payload() { data, rubroId }: { data: CreateManyElementoFromExcelDto[],  rubroId: string }
  ) {
    return this.elementosService.createManyFromExcel( data, rubroId )
  }
}
