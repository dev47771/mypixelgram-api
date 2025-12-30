import { Module } from '@nestjs/common';
import { PaymentApiController } from './payment/api/payment-api.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envFilePaths } from './env-file-paths';
import { validate } from './core/env.validation';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentModel } from './models/payment.model';
import { SubscriptionModel } from './models/subscription.model';
import { URL } from 'node:url';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // @ts-ignore
        const dbUrl = new URL(config.get<string>('DATABASE_URL'));

        return {
          dialect: 'mysql',
          host: dbUrl.hostname,
          port: Number(dbUrl.port),
          database: dbUrl.pathname.replace('/', ''),
          username: dbUrl.username,
          password: dbUrl.password,

          models: [PaymentModel, SubscriptionModel],
          logging: console.log,
        };
      },
    }),

    SequelizeModule.forFeature([PaymentModel, SubscriptionModel]),
  ],
  controllers: [PaymentApiController],
  providers: [],
})
export class PaymentApiModule {}
