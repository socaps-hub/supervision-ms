import { ParseUUIDPipe } from '@nestjs/common'; 
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { CreateUsuarioArgs } from './dto/args/create-usuario.arg';

@Resolver(() => Usuario)
export class UsuariosResolver {

  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => Usuario)
  createUsuario(
    @Args() createUsuarioArgs: CreateUsuarioArgs,
  ) {
    return this.usuariosService.create( createUsuarioArgs );
  }

  @Query(() => [Usuario], { name: 'usuarios' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @Args() usuario: Usuario
  ) {
    return this.usuariosService.findAll( validRoles.role, usuario );
  }

  @Query(() => Usuario, { name: 'usuario' })
  findByNI(
    @Args('ni', { type: () => String }) ni: string
  ) {
    return this.usuariosService.findByNI(ni, true);
  }

  // @Mutation(() => Usuario)
  // updateUsuario(@Args('updateUsuarioInput') updateUsuarioInput: UpdateUsuarioInput) {
  //   return this.usuariosService.update(updateUsuarioInput.id, updateUsuarioInput);
  // }

  @Mutation(() => Usuario)
  desactivateUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string) {
    return this.usuariosService.desactivate(id);
  }

  @Mutation(() => Usuario)
  activateUser(
    @Args('userNI', { type: () => String }) userNI: string) {
    return this.usuariosService.activate(userNI.toUpperCase());
  }
}
