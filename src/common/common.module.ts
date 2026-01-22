import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { ExcelModule } from './excel/excel.module';
import { AwsModule } from './aws/aws.module';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: envs.jwtSecret,
            signOptions: { expiresIn: '2h' },
        }),
        ExcelModule,
        AwsModule,
        // NatsModule,
    ],
})
export class CommonModule {}
