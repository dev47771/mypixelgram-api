import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { NotificationsInfiniteResponseDto } from '../../dto/notifications-infinite-response.dto';

export function NotificationsInfinitySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get my notifications with infinite scroll',
      description: 'Returns user notifications with cursor-based infinite pagination. ' + 'On the first request, omit the cursor. ' + 'Use pageInfo.nextCursor for the next page.',
    }),

    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'ID of the last notification from the previous page. ' + 'Used only as a cursor and not included in the next page.',
    }),

    ApiResponse({
      status: 200,
      description: 'Successfully retrieved notifications page.',
      type: NotificationsInfiniteResponseDto,
    }),

    ApiUnauthorizedResponse({
      description: 'JWT token is missing or invalid.',
    }),
  );
}
export function MarkNotificationReadSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Mark notification as read',
      description: 'Marks a specific notification as read for the current user',
    }),
    ApiParam({
      name: 'id',
      description: 'Notification id',
      example: 'c3c829a4-9f2c-4e2f-9e4b-9f6d1320d1a3',
    }),
    ApiResponse({
      status: 200,
      description: 'Notification marked as read',
      schema: {
        example: {
          count: 1,
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token is missing or invalid',
    }),
  );
}

export function MarkAllNotificationsReadSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Mark all notifications as read',
      description: 'Marks all notifications of the current user as read',
    }),
    ApiResponse({
      status: 200,
      description: 'All notifications marked as read',
      schema: {
        example: {
          count: 5,
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'JWT token is missing or invalid',
    }),
  );
}
