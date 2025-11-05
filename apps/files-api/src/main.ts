import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(FilesApiModule);
  console.log(`files-api application started on port ${process.env.PORT}`);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
