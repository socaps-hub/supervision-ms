import { Module } from '@nestjs/common';
import { MovimientosModule } from './movimientos/movimientos.module';
import { Fase1RegistroModule } from './fase1-registro/fase1-registro.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
    imports: [
        MovimientosModule,
        Fase1RegistroModule,
        ReportesModule,
    ]
})
export class SisconcapModule {}
