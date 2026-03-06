import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRepo } from '../../infrastructure/notification.repo';

export class MarkAllNotificationsReadCommand {
  constructor(public readonly userId: string) {}
}
@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler implements ICommandHandler<MarkAllNotificationsReadCommand> {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async execute(command: MarkAllNotificationsReadCommand) {
    const { userId } = command;
    return this.notificationRepo.markAllAsRead(userId);
  }
}
