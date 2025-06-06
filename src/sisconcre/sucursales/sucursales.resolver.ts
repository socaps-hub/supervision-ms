import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './entities/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Resolver(() => Sucursal)
export class SucursalesResolver {

  constructor(private readonly sucursalesService: SucursalesService) {}

  // @Mutation(() => Sucursale)
  // createSucursale(@Args('createSucursaleInput') createSucursaleInput: CreateSucursaleInput) {
  //   return this.sucursalesService.create(createSucursaleInput);
  // }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll(
    @Args() user: Usuario
  ) {
    console.log(user);
    
    return this.sucursalesService.findAll( user );
  }

  @Query(() => Sucursal, { name: 'sucursal' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @Args() user: Usuario
  ) {
    return this.sucursalesService.findOne(id, user);
  }

  // @Mutation(() => Sucursale)
  // updateSucursale(@Args('updateSucursaleInput') updateSucursaleInput: UpdateSucursaleInput) {
  //   return this.sucursalesService.update(updateSucursaleInput.id, updateSucursaleInput);
  // }

  // @Mutation(() => Sucursale)
  // removeSucursale(@Args('id', { type: () => Int }) id: number) {
  //   return this.sucursalesService.remove(id);
  // }
}
