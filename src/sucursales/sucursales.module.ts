import { Module } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { SucursalesResolver } from './sucursales.resolver';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { CooperativasModule } from 'src/cooperativas/cooperativas.module';

@Module({
  providers: [SucursalesResolver, SucursalesService],
  imports: [ 
    UsuariosModule,
    CooperativasModule,
  ]
})
export class SucursalesModule {}
