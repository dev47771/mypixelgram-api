import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { SubscriptionModel } from '../../models/subscription.model';
import { ClientProxy } from '@nestjs/microservices';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class OutboxScheduler {
  constructor(
    @InjectModel(SubscriptionModel)
    private subscriptionModel: typeof SubscriptionModel,

    @InjectConnection()
    private sequelize: Sequelize,

    @Inject('RABBITMQ_CLIENT')
    private rabbitClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox() {
    console.log(' [SCHEDULER] Проверяем outbox...');

    const subscriptions = await this.subscriptionModel.findAll({
      where: this.sequelize.literal('outboxEvents IS NOT NULL AND JSON_LENGTH(outboxEvents) > 0'),
    });

    console.log(' [SCHEDULER] Найдено:', subscriptions.length);

    for (const subscription of subscriptions) {
      const events = subscription.outboxEvents || [];

      for (const event of events) {
        console.log(' Отправляем:', event.type);

        this.rabbitClient.emit(event.type, event.payload);
        console.log('RabbitMQ отправлено!');
      }

      await subscription.update({ outboxEvents: [] });
      console.log('Очистили подписку:', subscription.id);
    }
  }
}
