import { Module } from '@nestjs/common';
import { GruposModule } from './grupos/grupos.module';
import { RubrosModule } from './rubros/rubros.module';

@Module({
  imports: [GruposModule, RubrosModule]
})
export class EstructuraModule {}
