import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesApiModule, {
    transport: Transport.TCP,
    options: { port: 4001 },
  });
  await app.listen();
}

bootstrap();
