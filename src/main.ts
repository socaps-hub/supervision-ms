import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main')

  logger.log(`App running on port ${ envs.port }`)

  app.enableCors();

  await app.listen( envs.port );
}
bootstrap();
