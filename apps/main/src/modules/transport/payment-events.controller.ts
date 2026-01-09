import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { UsersRepo } from '../user-accounts/infrastructure/users.repo';

@Controller()
export class PaymentEventsController {
  constructor(private usersRepo: UsersRepo) {}
  @EventPattern('subscription.purchased')
  async handleSubscriptionPurchased(payload: any) {
    console.log('[MAIN] Получено subscription.purchased:', payload);

    try {
      await this.usersRepo.updateSubscription(payload.userId, payload.planName, new Date(payload.expiresAt), 'BUSINESS');

      console.log('[MAIN] User обновлён:', payload.userId);
    } catch (error) {
      console.error('Ошибка обновления подписки:', error);
    }
  }
}
