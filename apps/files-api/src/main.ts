import { NestFactory } from '@nestjs/core';
import { FilesApiModule } from './files-api.module';

async function bootstrap() {
  const app = await NestFactory.create(FilesApiModule);
  console.log('files-api application started on port 3001');
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
