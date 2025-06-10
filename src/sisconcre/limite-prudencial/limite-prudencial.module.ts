import { Module } from '@nestjs/common';
import { LimitePrudencialService } from './limite-prudencial.service';
import { LimitePrudencialResolver } from './limite-prudencial.resolver';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { LimitePrudencialHandler } from './limite-prudencial.handler';

@Module({
  imports: [
    UsuariosModule,
  ],
  controllers: [
    LimitePrudencialHandler
  ],
  providers: [
    LimitePrudencialResolver, 
    LimitePrudencialService,
  ],
})
export class LimitePrudencialModule {}
