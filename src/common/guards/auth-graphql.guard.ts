import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { Request } from 'express';
import { envs } from 'src/config';
import { UsuariosService } from 'src/sisconcre/usuarios/usuarios.service';
  
@Injectable()
export class AuthGraphQLGuard implements CanActivate {

    constructor(
        private readonly _jwtService: JwtService,
        private readonly _usuariosService: UsuariosService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const ctx = GqlExecutionContext.create( context )
        const request = ctx.getContext().req
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
            throw new RpcException({
                message: 'Token not found',
                status: HttpStatus.UNAUTHORIZED
            });
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }

}
  