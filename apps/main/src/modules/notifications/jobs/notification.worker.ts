import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationRepo } from '../infrastructure/notification.repo';
import { NotificationsWsService } from '../application/notifications-ws.service';
import { createRedisConnection } from './create-redis-connection';

const NOTIFICATIONS_QUEUE = '{notifications}';

@Injectable()
export class NotificationWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    private readonly notificationRepo: NotificationRepo,
    private readonly notificationsWsService: NotificationsWsService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const connection = createRedisConnection(this.configService);

    this.worker = new Worker(
      NOTIFICATIONS_QUEUE,
      async (job) => {
        const { userId, planName, expiresAt } = job.data;

        const notification = await this.notificationRepo.create({
          userId,
          title: 'Subscription expiring soon',
          description: `Your ${planName} subscription will expire on ${new Date(expiresAt).toLocaleDateString()}`,
        });

        this.notificationsWsService.notifyUser(userId, 'notifications:new', {
          id: notification.id,
          title: notification.title,
          description: notification.description,
          createdAt: notification.createdAt,
        });

        console.log(`[MAIN] Notification sent for user ${userId}, jobId: ${job.id}`);
      },
      { connection },
    );

    this.worker.on('failed', (job, err) => {
      console.error('[NOTIFICATIONS WORKER FAILED]', job?.id, err);
    });

    console.log('[MAIN] NotificationWorkerService started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      console.log('[MAIN] NotificationWorkerService stopped');
    }
  }
}
