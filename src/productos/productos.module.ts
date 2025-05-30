import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosResolver } from './productos.resolver';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { CategoriasModule } from 'src/categorias/categorias.module';

@Module({
  providers: [ProductosResolver, ProductosService],
  imports: [
    UsuariosModule,
    CategoriasModule,
  ]
})
export class ProductosModule {}
