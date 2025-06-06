import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosResolver } from './productos.resolver';
import { CategoriasModule } from '../categorias/categorias.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  providers: [ProductosResolver, ProductosService],
  imports: [
    UsuariosModule,
    CategoriasModule,
  ]
})
export class ProductosModule {}
