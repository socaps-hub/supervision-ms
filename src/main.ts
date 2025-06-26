import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Supervision-ms')

  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natServers,
    }
  })
  console.log(envs.natServers);
  
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.startAllMicroservices()
  await app.init()
  console.log('✅ Microservicio conectado a NATS (Supervision-MS)');
  
  await app.listen( envs.port ) // GraphQL Expuesto localmente
  logger.log(`Supervision Microservice running on port ${ envs.port }`)
}
bootstrap();
