import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesApiModule, {
    transport: Transport.TCP,
    options: { port: Number(process.env.PORT_FILES_API) },
  });
  console.log(`Files API application started on port ${process.env.PORT_FILES_API}`);
  await app.listen();
}

bootstrap();
