import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationPublisherService implements OnModuleInit, OnModuleDestroy {
  private notificationsQueue: Queue;
  private connection: IORedis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = Number(this.configService.get<string>('REDIS_PORT'));
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisUsername = this.configService.get<string>('REDIS_USERNAME');
    const redisTlsEnabled = this.configService.get<string>('REDIS_TLS_ENABLED') === 'true';
    const queueName = this.configService.get<string>('NOTIFICATIONS_QUEUE') || '{notifications}';

    this.connection = new IORedis({
      host: redisHost,
      port: redisPort,
      username: redisUsername,
      password: redisPassword,
      tls: redisTlsEnabled ? { servername: redisHost, minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null,
    });

    this.notificationsQueue = new Queue(queueName, { connection: this.connection });

    console.log('[PAYMENT] NotificationPublisherService initialized');
  }

  async onModuleDestroy() {
    if (this.notificationsQueue) {
      await this.notificationsQueue.close();
    }
    if (this.connection) {
      await this.connection.quit();
    }
    console.log('[PAYMENT] NotificationPublisherService destroyed');
  }

  async scheduleSubscriptionReminder(userId: string, subscriptionId: string, planName: string, expiresAt: string, delayMs?: number) {
    const defaultDelay = 24 * 60 * 60 * 1000;
    const delay = delayMs ?? defaultDelay;

    await this.notificationsQueue.add('subscription.reminder', { userId, subscriptionId, planName, expiresAt }, { delay });

    console.log(`[PAYMENT] Delayed notification job scheduled for user ${userId}, subscription ${subscriptionId}, delay ${delay}ms`);
  }
  async ensureSubscriptionReminderJob(subscriptionId: number, userId: string, planName: string, expiresAt: string, delayMs: number) {
    const jobId = `subscription-reminder:${subscriptionId}`;

    const existingJob = await this.notificationsQueue.getJob(jobId);
    if (existingJob) {
      return;
    }

    await this.notificationsQueue.add(
      'subscription.reminder',
      { userId, subscriptionId: subscriptionId.toString(), planName, expiresAt },
      {
        jobId,
        delay: delayMs,
      },
    );

    console.log(`[RECOVERY] Reminder job восстановлен для subscription ${subscriptionId}`);
  }
}
