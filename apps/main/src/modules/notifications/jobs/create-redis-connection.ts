import { ConfigService } from '@nestjs/config';

export function createRedisConnection(configService: ConfigService) {
  const tlsEnabled = configService.get<string>('REDIS_TLS_ENABLED') === 'true';

  const host = configService.get<string>('REDIS_HOST')!;
  const port = Number(configService.get<string>('REDIS_PORT')!);

  const username = configService.get<string>('REDIS_USERNAME');
  const password = configService.get<string>('REDIS_PASSWORD');

  return {
    host,
    port,
    ...(username ? { username } : {}),
    ...(password ? { password } : {}),
    tls: tlsEnabled
      ? {
          servername: host,
          minVersion: 'TLSv1.2' as const,
          rejectUnauthorized: false,
        }
      : undefined,
    maxRetriesPerRequest: null,
  };
}
