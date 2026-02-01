import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Sequelize } from 'sequelize-typescript';
import { SubscriptionModel } from '../../models/subscription.model';

@Injectable()
export class OutboxScheduler implements OnModuleInit {
  constructor(
    @InjectModel(SubscriptionModel)
    private subscriptionModel: typeof SubscriptionModel,

    @InjectConnection()
    private sequelize: Sequelize,

    @Inject('RABBITMQ_CLIENT')
    private rabbitClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.rabbitClient.connect();
    console.log('[SCHEDULER] RMQ connected, scheduler ready');
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox() {
    console.log('[SCHEDULER] Проверяем outbox...');

    const subscriptions = await this.subscriptionModel.findAll({
      where: this.sequelize.literal('outboxEvents IS NOT NULL AND JSON_LENGTH(outboxEvents) > 0'),
    });

    console.log('[SCHEDULER] Найдено:', subscriptions.length);

    for (const subscription of subscriptions) {
      const events = subscription.outboxEvents || [];

      try {
        for (const event of events) {
          console.log('Отправляем:', event.type);

          await firstValueFrom(this.rabbitClient.emit(event.type, event.payload));

          console.log('RabbitMQ отправлено (без ошибки)');
        }

        await subscription.update({ outboxEvents: [] });
        console.log('Очистили подписку:', subscription.id);
      } catch (err) {
        console.error('[SCHEDULER] Ошибка отправки в RMQ, НЕ очищаем outbox:', err);
      }
    }
  }
}
