import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './setup/global-prefix.setup';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const DynamicAppModule = await AppModule.forRoot(configService);

  const app = await NestFactory.create(DynamicAppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  });
  await appContext.close();

  appSetup(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log('main application started on port 3000');
}
bootstrap();
