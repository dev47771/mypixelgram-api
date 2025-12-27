import { Module } from '@nestjs/common';

import { PaymentApiController } from './payment/api/payment-api.controller';
import { ConfigModule } from '@nestjs/config';
import { envFilePaths } from './env-file-paths';
import { validate } from './core/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
      isGlobal: true,
    }),
  ],
  controllers: [PaymentApiController],
  providers: [],
})
export class PaymentApiModule {}
