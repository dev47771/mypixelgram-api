import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
  swaggerSetup(app);
  pipesSetup(app);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'https://mypixelgram.ru', 'http://mypixelgram.ru:3000', 'https://mypixelgram.ru:3000', 'https://app.mypixelgram.ru:3000', 'https://app.mypixelgram.ru:3001'],
    credentials: true,
  });
}
