import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursaleInput } from './dto/create-sucursale.input';
import { UpdateSucursaleInput } from './dto/update-sucursale.input';

@Resolver(() => Sucursal)
export class SucursalesResolver {

  constructor(private readonly sucursalesService: SucursalesService) {}

  // @Mutation(() => Sucursale)
  // createSucursale(@Args('createSucursaleInput') createSucursaleInput: CreateSucursaleInput) {
  //   return this.sucursalesService.create(createSucursaleInput);
  // }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll() {
    return this.sucursalesService.findAll();
  }

  // @Query(() => Sucursale, { name: 'sucursale' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.sucursalesService.findOne(id);
  // }

  // @Mutation(() => Sucursale)
  // updateSucursale(@Args('updateSucursaleInput') updateSucursaleInput: UpdateSucursaleInput) {
  //   return this.sucursalesService.update(updateSucursaleInput.id, updateSucursaleInput);
  // }

  // @Mutation(() => Sucursale)
  // removeSucursale(@Args('id', { type: () => Int }) id: number) {
  //   return this.sucursalesService.remove(id);
  // }
}
