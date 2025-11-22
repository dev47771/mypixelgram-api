import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

async function bootstrap() {
  const isLocal = process.env.NODE_ENV === 'development.local';

  const port = isLocal ? Number(process.env.FILES_API_MICROSERVICE_PORT) : Number(process.env.PORT_FILES_API);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FilesApiModule, {
    transport: Transport.TCP,
    options: {
      port,
      ...(isLocal ? {} : { host: '0.0.0.0' }),
      retryAttempts: 5,
      retryDelay: 3000,
      maxBufferSize: 1024 * 1024 * 50,
    },
  });

  console.log(`Files API application started on port ${port} (env=${process.env.NODE_ENV})`);

  await app.listen();
}

bootstrap();
