import { Module } from '@nestjs/common';
import { LimitePrudencialModule } from './limite-prudencial/limite-prudencial.module';
import { ProductosModule } from './productos/productos.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
    imports: [
        UsuariosModule,
        ProductosModule,
        LimitePrudencialModule,
    ], 
    providers: []
})
export class SisconcreModule {}
