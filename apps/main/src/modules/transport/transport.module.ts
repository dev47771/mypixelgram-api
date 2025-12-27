import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'FILES_API',
        useFactory: async (configService: ConfigService) => {
          const isLocal = process.env.NODE_ENV === 'development.local';

          return {
            transport: Transport.TCP,
            options: isLocal
              ? {
                  port: Number(configService.get<string>('FILES_API_PORT')),
                }
              : {
                  port: Number(configService.get<string>('FILES_API_PORT')),
                  host: configService.get<string>('FILES_API_HOST'),
                },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'PAYMENT',
        useFactory: async (configService: ConfigService) => {
          const isLocal = process.env.NODE_ENV === 'development.local';

          return {
            transport: Transport.TCP,
            options: isLocal
              ? {
                  port: Number(configService.get('PAYMENT_API_PORT')),
                }
              : {
                  port: Number(configService.get('PAYMENT_API_PORT')),
                  host: configService.get('PAYMENT_API_HOST'),
                },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TransportService],
  controllers: [],
  exports: [TransportService],
})
export class TransportModule {}
