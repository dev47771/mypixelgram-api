import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'FILES_API',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            port: configService.get('PORT_FILES_API'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TransportService],
  controllers: [],
  exports: [TransportService],
})
export class TransportModule {}
