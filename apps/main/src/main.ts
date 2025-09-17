import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const DynamicAppModule = await AppModule.forRoot(configService);

  const app = await NestFactory.create(DynamicAppModule);
  await appContext.close();

  appSetup(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log('main application started on port 3000');
}
bootstrap();
