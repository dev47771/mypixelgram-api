import { forwardRef, Module } from '@nestjs/common';
import { MarkNotificationReadHandler } from './application/commands/mark-notification-read.use-case';
import { MarkAllNotificationsReadHandler } from './application/commands/mark-all-notification-read.use-case';
import { GetUserNotificationsInfinityHandler } from './application/commands/get-user-notifications.query';
import { NotificationsQueryRepo } from './infrastructure/get-user-notifications.query-repo';
import { NotificationRepo } from './infrastructure/notification.repo';
import { NotificationsGateway } from './api/notifications.gateway';
import { NotificationsController } from './api/notification.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { OnlineUsersStore } from './online-users.store';
import { NotificationsWsService } from './application/notifications-ws.service';
import { NotificationWorkerService } from './jobs/notification.worker';

const commandHandlers = [MarkNotificationReadHandler, MarkAllNotificationsReadHandler];
const queryHandlers = [GetUserNotificationsInfinityHandler];
const commonProviders = [NotificationsQueryRepo, NotificationRepo, NotificationsGateway, OnlineUsersStore, NotificationsWsService, NotificationWorkerService];

@Module({
  imports: [forwardRef(() => UserAccountsModule)],
  controllers: [NotificationsController],
  providers: [...commandHandlers, ...commonProviders, ...queryHandlers],
  exports: [NotificationRepo, NotificationsWsService],
})
export class NotificationsModule {}
