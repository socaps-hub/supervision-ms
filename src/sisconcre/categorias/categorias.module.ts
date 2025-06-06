import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasResolver } from './categorias.resolver';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  providers: [CategoriasResolver, CategoriasService],
  imports: [
    UsuariosModule,
  ],
  exports: [
    CategoriasService,
  ]
})
export class CategoriasModule {}
