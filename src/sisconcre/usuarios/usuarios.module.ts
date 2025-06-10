import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { UsuariosHandler } from './usuarios.handler';

@Module({
  controllers: [ UsuariosHandler ],
  providers: [
    UsuariosResolver, 
    UsuariosService,
  ],
  exports: [
    UsuariosService
  ]
})
export class UsuariosModule {}
