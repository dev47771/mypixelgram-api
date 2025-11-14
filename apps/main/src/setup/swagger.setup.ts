import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('MyPixelGram API')
    .setDescription('API documentation for MyPixelGram application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'JWT Access Token - Add to Authorization header as: "Bearer {token}"',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh Token - Automatically sent as HttpOnly cookie',
      },
      'refreshToken',
    )
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
