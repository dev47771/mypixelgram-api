import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('MyPixelGram API')
    .setDescription('API documentation for MyPixelGram application')
    .setVersion('1.0')
    .addBearerAuth() // Для JWT авторизации
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken', // имя куки
      },
      'refreshToken', // имя схемы безопасности
    )
    .addBasicAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'MyPixelGram API Docs',
  });
}
