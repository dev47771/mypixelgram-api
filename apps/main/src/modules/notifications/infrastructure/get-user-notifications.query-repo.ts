import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

export const NOTIFICATIONS_PAGE_SIZE = 8;

@Injectable()
export class NotificationsQueryRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getFirstPage(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: NOTIFICATIONS_PAGE_SIZE + 1,
    });

    return this.formatPage(notifications);
  }

  async getNextPage(userId: string, cursor: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      cursor: { id: cursor },
      skip: 1,
      take: NOTIFICATIONS_PAGE_SIZE + 1,
    });

    return this.formatPage(notifications);
  }

  private formatPage(notifications: Notification[]) {
    const hasMore = notifications.length > NOTIFICATIONS_PAGE_SIZE;
    const items = hasMore ? notifications.slice(0, NOTIFICATIONS_PAGE_SIZE) : notifications;
    const lastItem = items[items.length - 1] ?? null;
    const nextCursor = lastItem ? lastItem.id : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  }
}
