import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '@prisma/client';

export class NotificationViewDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'New subscription started' })
  title: string;

  @ApiProperty({ example: 'Your subscription has been successfully activated' })
  description: string;

  @ApiProperty({ example: 'unreaded' })
  status: 'unreaded' | 'readed';

  @ApiProperty({ example: '2026-02-05T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-05T12:01:00.000Z' })
  updatedAt: Date;
}

export class NotificationsInfiniteResponseDto {
  @ApiProperty({ type: [NotificationViewDto] })
  items: NotificationViewDto[];

  @ApiProperty({ example: true })
  hasMore: boolean;

  @ApiProperty({ example: 'uuid-5678' })
  nextCursor: string | null;

  static mapToView(data: { items: Notification[]; nextCursor: string | null; hasMore: boolean }): NotificationsInfiniteResponseDto {
    return {
      items: data.items.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        status: n.status,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
      nextCursor: data.nextCursor,
      hasMore: data.hasMore,
    };
  }
}
