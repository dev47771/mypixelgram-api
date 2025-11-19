import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { FILES_API_HOST, FILES_API_PORT } from './constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FILES_API',
        transport: Transport.TCP,
        options: {
          port: FILES_API_PORT,
          host: FILES_API_HOST,
        },
      },
    ]),
  ],
  providers: [TransportService],
  controllers: [],
  exports: [TransportService],
})
export class TransportModule {}
