import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { envs } from 'src/config';
import { UsuariosService } from 'src/usuarios/usuarios.service';
  
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly _jwtService: JwtService,
        private readonly _usuariosService: UsuariosService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)

        if (!token) {
            throw new UnauthorizedException('Token not found')
        }

        try {
            const payload = await this._jwtService.verifyAsync(
                token,
                {
                    secret: envs.jwtSecret
                }
            );

            const user = await this._usuariosService.findByID( payload.R12Id )

            request['user'] = user;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }

}
  