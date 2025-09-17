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
    EMAIL_CONFIRMATION_CODE_LIFETIME_SECS: Joi.number().required(),
    MAIL_TRANSPORT: Joi.string().required(),
    MAIL_FROM_NAME: Joi.string().required(),
    HTTP_BASIC_USER: Joi.string().required(),
    HTTP_BASIC_PASS: Joi.string().required(),
    INCLUDE_TESTING_MODULE: Joi.boolean().required(),
    DB_LOGGING: Joi.boolean().required(),
  }),
});
