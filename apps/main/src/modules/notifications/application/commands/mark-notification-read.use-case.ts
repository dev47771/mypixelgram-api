import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRepo } from '../../infrastructure/notification.repo';

export class MarkNotificationReadCommand {
  constructor(
    public readonly userId: string,
    public readonly notificationId: string,
  ) {}
}

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async execute(command: MarkNotificationReadCommand) {
    const { userId, notificationId } = command;
    return this.notificationRepo.markAsRead(userId, notificationId);
  }
}
