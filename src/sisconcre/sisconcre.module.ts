import { Module } from '@nestjs/common';
import { LimitePrudencialModule } from './limite-prudencial/limite-prudencial.module';

@Module({
    imports: [
        LimitePrudencialModule,
    ], 
    providers: []
})
export class SisconcreModule {}
