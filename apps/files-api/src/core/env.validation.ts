import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT_FILES_API: number;

  @IsString()
  BUCKET_NAME: string;

  @IsString()
  BUCKET_SECRET_ACCESS_KEY: string;

  @IsString()
  BUCKET_ACCESS_KEY_ID: string;

  @IsString()
  BUCKET_ENDPOINT: string;

  @IsString()
  BUCKET_REGION: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  MONGO_URL: string;
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
