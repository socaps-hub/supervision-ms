import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/inputs/create-usuario.input';
import { UpdateUsuarioInput } from './dto/inputs/update-usuario.input';
import { ValidRolesArgs } from './dto/args/roles.arg';

@Resolver(() => Usuario)
export class UsuariosResolver {

  constructor(private readonly usuariosService: UsuariosService) {}

  @Mutation(() => Usuario)
  createUsuario(
    @Args('createUsuarioInput') createUsuarioInput: CreateUsuarioInput
  ) {
    return this.usuariosService.create(createUsuarioInput);
  }

  @Query(() => [Usuario], { name: 'usuarios' })
  findAll(
    @Args() validRoles: ValidRolesArgs
  ) {
    return this.usuariosService.findAll( validRoles.role );
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

  // @Mutation(() => Usuario)
  // removeUsuario(@Args('id', { type: () => Int }) id: number) {
  //   return this.usuariosService.remove(id);
  // }
}
