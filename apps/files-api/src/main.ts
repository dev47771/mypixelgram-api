import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesApiModule, {
    transport: Transport.TCP,
    options: {
      port: 4112,
      retryAttempts: 5,
      retryDelay: 3000,
      maxBufferSize: 1024 * 1024 * 50,
    },
  });

  console.log(`Files API application started on port ${process.env.PORT_FILES_API}`);
  await app.listen();
}

bootstrap();
