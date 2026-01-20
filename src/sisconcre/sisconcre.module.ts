import { Module } from '@nestjs/common';
import { LimitePrudencialModule } from './limite-prudencial/limite-prudencial.module';
import { ReportesModule } from './reportes/reportes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';

@Module({
    imports: [
        LimitePrudencialModule,
        ReportesModule,
        AuditoriaModule,
        SolicitudesModule,
    ], 
    providers: []
})
export class SisconcreModule {}
