import { Module } from '@nestjs/common';
import { PaymentApiController } from './payment/api/payment-api.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envFilePaths } from './env-file-paths';
import { validate } from './core/env.validation';
import { PaymentModel } from './models/payment.model';
import { SubscriptionModel } from './models/subscription.model';
import { URL } from 'node:url';
import { StripeCheckoutService } from './payment/application/stripe-checkout.service';
import { PaymentRepo } from './payment/infrastructure/payment-repo';
import { CreateSubscriptionCheckoutUseCase } from './payment/application/create-stripe-checkout.usecase';
import { SubscriptionRepo } from './payment/infrastructure/subscription-repo';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { StripeWebhookController } from './payment/api/stripe-webhook.controller';
import { StripeWebhookService } from './payment/application/stripe-webhook.service';
import { OutboxScheduler } from './payment/jobs/outbox.scheduler';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GetUserPaymentsQueryHandler } from './payment/application/get-user-payments.query-handler';
import { SubscriptionPlansService } from './payment/domain/plans.config';
import { CancelStripeSubscriptionUseCase } from './payment/application/cancle-subscription.usecase';
export const CommandHandlers = [CreateSubscriptionCheckoutUseCase, GetUserPaymentsQueryHandler, CancelStripeSubscriptionUseCase];

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'main_events',
          queueOptions: { durable: true },
        },
      },
    ]),
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
        };
      },
    }),

    SequelizeModule.forFeature([PaymentModel, SubscriptionModel]),
    CqrsModule,
  ],
  controllers: [PaymentApiController, StripeWebhookController],
  providers: [SubscriptionRepo, PaymentRepo, StripeCheckoutService, ...CommandHandlers, StripeWebhookService, OutboxScheduler, SubscriptionPlansService],
})
export class PaymentApiModule {}
