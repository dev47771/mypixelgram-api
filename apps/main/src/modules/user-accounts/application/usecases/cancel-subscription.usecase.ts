import { UsersRepo } from '../../infrastructure/users.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { TransportService } from '../../../transport/transport.service';
import { NotificationRepo } from '../../../notifications/infrastructure/notification.repo';
import { NotificationsWsService } from '../../../notifications/application/notifications-ws.service';

export class CancelSubscriptionCommand {
  constructor(public userId: string) {}
}
@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionUseCase implements ICommandHandler<CancelSubscriptionCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly transportService: TransportService,
    private readonly notificationRepo: NotificationRepo,
    private readonly notificationsWsService: NotificationsWsService,
  ) {}

  async execute(command: CancelSubscriptionCommand) {
    const user = await this.usersRepo.findById(command.userId);

    if (!user?.planName) {
      throw BadRequestDomainException.create(ErrorConstants.PAYMENT_NOT_FOUND, 'CancelSubscriptionCommand');
    }

    try {
      await this.transportService.cancelStripeSubscription({
        userId: command.userId,
      });

      await this.usersRepo.updateSubscription(command.userId, null, null, 'PERSONAL');
    } catch (error) {
      console.error('[CancelSubscription] Failed:', error);
      throw error;
    }

    const notification = await this.notificationRepo.create({
      userId: command.userId,
      title: 'Subscription canceled',
      description: 'Your subscription has been successfully canceled. You have been switched to the personal plan.',
    });

    this.notificationsWsService.notifyUser(command.userId, 'notifications:new', {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      createdAt: notification.createdAt,
    });

    return { success: true };
  }
}
