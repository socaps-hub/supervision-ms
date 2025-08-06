import { Module } from '@nestjs/common';
import { LimitePrudencialModule } from './limite-prudencial/limite-prudencial.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
    imports: [
        LimitePrudencialModule,
        ReportesModule,
    ], 
    providers: []
})
export class SisconcreModule {}
