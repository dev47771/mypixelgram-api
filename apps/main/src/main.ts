import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSetup(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log('main application started on port 3000');
}
bootstrap();
