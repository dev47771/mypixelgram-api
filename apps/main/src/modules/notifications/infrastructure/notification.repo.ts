import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationRepo {
  constructor(private readonly prisma: PrismaService) {}

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { status: 'readed' },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, status: 'unreaded' },
      data: { status: 'readed' },
    });
  }
  async countUnreadByUser(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: 'unreaded',
      },
    });
  }
  async create(params: { userId: string; title: string; description: string }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        description: params.description,
        status: NotificationStatus.unreaded,
      },
    });
  }
}
