import IORedis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export function createRedisConnection(configService: ConfigService): IORedis {
  const tlsEnabled = configService.get<string>('REDIS_TLS_ENABLED') === 'true';

  return new IORedis({
    host: configService.get<string>('REDIS_HOST'),
    port: Number(configService.get<string>('REDIS_PORT')),
    username: configService.get<string>('REDIS_USERNAME'),
    password: configService.get<string>('REDIS_PASSWORD'),
    tls: tlsEnabled
      ? {
          servername: configService.get<string>('REDIS_HOST'),
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false,
        }
      : undefined,
    maxRetriesPerRequest: null,
  });
}
