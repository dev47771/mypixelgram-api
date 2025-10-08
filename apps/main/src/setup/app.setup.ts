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
}
