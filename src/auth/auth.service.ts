import { BadRequestException, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { bcryptAdapter } from 'src/config';
import { ValidRoles } from './enums/valid-roles.enum';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly _logger = new Logger('AuthService')

  constructor(
    private readonly _usuariosService: UsuariosService,
      private readonly _jwtService: JwtService,
  ) {
      super()
  }

  onModuleInit() {
      this.$connect()
      this._logger.log('Database connected')
  }

  async signJwt( payload: JwtPayload ) {
    return this._jwtService.sign(payload)
  }

  async login( { ni, password }: LoginUserDto ) {
     
    const user = await this._usuariosService.findByNI( ni.toUpperCase() )

    if ( user.R12Rol === ValidRoles.ejecutivo ) {
      throw new UnauthorizedException('No cuentas con los permisos necesarios para iniciar sesión')
    }

    if ( ni !== user.R12Ni ) {
      throw new BadRequestException('Usuario incorrecto')
    }

    if ( !bcryptAdapter.compare( password, user.R12Password ) ) {
      throw new BadRequestException('Credenciales incorrectas')
    }

    const { R12Password, ...rest } = user
    
    return {
      user: rest,
      token: await this.signJwt({ R12Id: user.R12Id, R12Suc_id: user.R12Suc_id, R12Coop_id: user.R12Coop_id })
    }

  }

  async checkAuthStatus( user: Usuario ) {

    const { R12Password, ...rest } = user

    return { 
      user: rest,
      token: await this.signJwt({ R12Id: user.R12Id, R12Suc_id: user.R12Suc_id, R12Coop_id: user.R12Coop_id })
    }
  }

}
