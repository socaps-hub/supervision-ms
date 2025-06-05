import { Module } from '@nestjs/common';
import { LimitePrudencialService } from './limite-prudencial.service';
import { LimitePrudencialResolver } from './limite-prudencial.resolver';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  providers: [LimitePrudencialResolver, LimitePrudencialService],
  imports: [
    UsuariosModule,
  ]
})
export class LimitePrudencialModule {}
