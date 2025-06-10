import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosResolver } from './productos.resolver';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ProductosHandler } from './productos.handler';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    UsuariosModule,
    NatsModule,
  ],
  controllers: [ ProductosHandler ],
  providers: [
    ProductosResolver, 
    // ProductosHandler,
    ProductosService, 
  ],
})
export class ProductosModule {}
