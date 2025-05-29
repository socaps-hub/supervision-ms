import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/user.decorator';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { AuthGuard } from './guards/auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @UseGuards( AuthGuard )
  checkAuthStatus(
    @GetUser() user: Usuario,
  ) {
    return this.authService.checkAuthStatus( user )
  }


}
