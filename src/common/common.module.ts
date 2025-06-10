import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { UsuariosModule } from 'src/sisconcre/usuarios/usuarios.module';

@Module({
    imports: [
        UsuariosModule,

        JwtModule.register({
            global: true,
            secret: envs.jwtSecret,
            signOptions: { expiresIn: '2h' },
        }),
    ]
})
export class CommonModule {}
