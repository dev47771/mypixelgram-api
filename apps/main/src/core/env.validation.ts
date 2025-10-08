import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'testing',
  Provision = 'provision',
  DevelopmentHome = 'development.local',
  TestHome = 'testing.local',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  EMAIL_CONFIRMATION_CODE_LIFETIME_SECS: number;

  @IsString()
  HTTP_BASIC_USER: string;

  @IsString()
  HTTP_BASIC_PASS: string;

  @IsBoolean()
  INCLUDE_TESTING_MODULE: boolean;

  @IsBoolean()
  SKIP_PASSWORD_CHECK: boolean;

  @IsString()
  JWT_SECRET_KEY: string;

  @IsBoolean()
  DB_LOGGING: boolean;

  @IsString()
  MAIL_MODULE_HOST: string;

  @IsString()
  MAIL_MODULE_USER: string;

  @IsString()
  MAIL_MODULE_PASSWORD: string;

  @IsString()
  MAIL_MODULE_FROM: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
