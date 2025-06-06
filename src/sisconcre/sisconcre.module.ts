import { Module } from '@nestjs/common';
import { CategoriasModule } from './categorias/categorias.module';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { LimitePrudencialModule } from './limite-prudencial/limite-prudencial.module';
import { ProductosModule } from './productos/productos.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
    imports: [
        UsuariosModule,
        SucursalesModule,
        CooperativasModule,
        ProductosModule,
        CategoriasModule,
        LimitePrudencialModule,
    ]
})
export class SisconcreModule {}
