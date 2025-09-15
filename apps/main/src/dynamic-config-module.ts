import { ConfigModule } from '@nestjs/config';
import { envFilePaths } from './env-file-paths';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  envFilePath: envFilePaths,
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'testing', 'staging')
      .required(),
    DATABASE_URL: Joi.string().required(),
  }),
});
