import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { NotificationPublisherService } from './subscription.jobs';

@Injectable()
export class SubscriptionReminderRecoveryJob {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepo,
    private readonly notificationPublisher: NotificationPublisherService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async recoverMissingReminderJobs() {
    const subscriptions = await this.subscriptionRepo.findActiveWithExpiresAt();

    const now = Date.now();
    const notifyBeforeMs = (23 * 60 + 59) * 60 * 1000;

    for (const sub of subscriptions) {
      if (!sub.expiresAt) continue;

      const delayMs = new Date(sub.expiresAt).getTime() - now - notifyBeforeMs;
      if (delayMs <= 0) continue;

      await this.notificationPublisher.ensureSubscriptionReminderJob(sub.id, sub.userId, sub.planName, sub.expiresAt.toISOString(), delayMs);
    }

    console.log(`[RECOVERY] Проверка напоминаний завершена`);
  }
}
