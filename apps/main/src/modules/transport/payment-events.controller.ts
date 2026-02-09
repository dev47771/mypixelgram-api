import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { UsersRepo } from '../user-accounts/infrastructure/users.repo';
import { NotificationRepo } from '../notifications/infrastructure/notification.repo';
import { NotificationsWsService } from '../notifications/application/notifications-ws.service';

@Controller()
export class PaymentEventsController {
  constructor(
    private usersRepo: UsersRepo,
    private readonly notificationRepo: NotificationRepo,
    private readonly notificationsWsService: NotificationsWsService,
  ) {}
  @EventPattern('subscription.purchased')
  async handleSubscriptionPurchased(payload: any) {
    console.log('[MAIN] Получено subscription.purchased:', payload);

    const { userId, planName, expiresAt } = payload;

    try {
      await this.usersRepo.updateSubscription(userId, planName, new Date(expiresAt), 'BUSINESS');

      const notification = await this.notificationRepo.create({
        userId,
        title: 'Subscription activated',
        description: `Your ${planName} subscription is active until ${new Date(expiresAt).toLocaleDateString()}`,
      });

      this.notificationsWsService.notifyUser(userId, 'notifications:new', {
        id: notification.id,
        title: notification.title,
        description: notification.description,
        createdAt: notification.createdAt,
      });

      console.log('[MAIN] Notification создано и отправлено:', notification.id);
    } catch (error) {
      console.error('[MAIN] Ошибка обработки subscription.purchased:', error);
    }
  }
  @EventPattern('subscription.payment_failed')
  async handleSubscriptionPaymentFailed(payload: any) {
    console.log('[MAIN] Получено subscription.payment_failed:', payload);

    const { userId, planName } = payload;

    try {
      await this.usersRepo.updateSubscription(userId, planName, null, 'PERSONAL');

      const notification = await this.notificationRepo.create({
        userId,
        title: 'Payment failed',
        description: `Your ${planName} subscription payment failed. Please update your payment method.`,
      });

      this.notificationsWsService.notifyUser(userId, 'notifications:new', {
        id: notification.id,
        title: notification.title,
        description: notification.description,
        createdAt: notification.createdAt,
      });

      console.log('[MAIN] Notification о failed payment создано и отправлено:', notification.id);
    } catch (error) {
      console.error('[MAIN] Ошибка обработки subscription.payment_failed:', error);
    }
  }
}
