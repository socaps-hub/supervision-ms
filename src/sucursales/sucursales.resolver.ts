import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { SucursalesService } from './sucursales.service';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursaleInput } from './dto/create-sucursale.input';
import { UpdateSucursaleInput } from './dto/update-sucursale.input';
import { UseGuards } from '@nestjs/common';
import { AuthGraphQLGuard } from 'src/auth/guards/auth-graphql.guard';
import { GetUserGraphQL } from 'src/auth/decorators/user-graphql.decorator';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Resolver(() => Sucursal)
@UseGuards( AuthGraphQLGuard )
export class SucursalesResolver {

  constructor(private readonly sucursalesService: SucursalesService) {}

  // @Mutation(() => Sucursale)
  // createSucursale(@Args('createSucursaleInput') createSucursaleInput: CreateSucursaleInput) {
  //   return this.sucursalesService.create(createSucursaleInput);
  // }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll(
    @GetUserGraphQL() user: Usuario
  ) {
    console.log(user);
    
    return this.sucursalesService.findAll( user );
  }

  @Query(() => Sucursal, { name: 'sucursal' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @GetUserGraphQL() user: Usuario
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
