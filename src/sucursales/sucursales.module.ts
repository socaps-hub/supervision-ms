import { Module } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { SucursalesResolver } from './sucursales.resolver';

@Module({
  providers: [SucursalesResolver, SucursalesService],
})
export class SucursalesModule {}
