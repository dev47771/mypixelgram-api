import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PaymentEventsController } from './payment-events.controller';
import { UsersRepo } from '../user-accounts/infrastructure/users.repo';
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

          const host = isLocal ? 'localhost' : configService.get('PAYMENT_API_HOST');

          const port = Number(configService.get('PAYMENT_API_PORT'));

          console.log('[PAYMENT CLIENT CONFIG]', { isLocal, host, port });

          return {
            transport: Transport.TCP,
            options: { host, port },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TransportService, UsersRepo],
  controllers: [PaymentEventsController],
  exports: [TransportService],
})
export class TransportModule {}
