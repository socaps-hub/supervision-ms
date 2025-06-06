import { Module } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { SucursalesResolver } from './sucursales.resolver';
import { CooperativasModule } from '../cooperativas/cooperativas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  providers: [SucursalesResolver, SucursalesService],
  imports: [ 
    UsuariosModule,
    CooperativasModule,
  ]
})
export class SucursalesModule {}
