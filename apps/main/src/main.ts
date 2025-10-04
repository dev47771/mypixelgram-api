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
  await appContext.close();

  const config = new DocumentBuilder()
    .setTitle('MyPixelGram API')
    .setDescription('API documentation for MyPixelGram application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth() // Для JWT авторизации
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'MyPixelGram API Docs',
  });

  appSetup(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log('main application started on port 3000');
}
bootstrap();
