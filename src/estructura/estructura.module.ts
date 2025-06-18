import { Module } from '@nestjs/common';
import { GruposModule } from './grupos/grupos.module';
import { RubrosModule } from './rubros/rubros.module';
import { ElementosModule } from './elementos/elementos.module';

@Module({
  imports: [GruposModule, RubrosModule, ElementosModule]
})
export class EstructuraModule {}
