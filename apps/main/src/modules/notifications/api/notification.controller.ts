import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NOTIFICATIONS_ROUTE } from '../../user-accounts/domain/constants';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { ExtractDeviceAndIpDto } from '../../user-accounts/api/input-dto/extract-device-ip.input-dto';
import { GetMyNotificationsDto } from '../dto/get-notifications.input-dto';
import { GetUserNotificationsInfinityQuery } from '../application/commands/get-user-notifications.query';
import { MarkAllNotificationsReadSwagger, MarkNotificationReadSwagger, NotificationsInfinitySwagger } from './decorators/notifications.swagger.decorators';
import { MarkNotificationReadCommand } from '../application/commands/mark-notification-read.use-case';
import { MarkAllNotificationsReadCommand } from '../application/commands/mark-all-notification-read.use-case';

@Controller(NOTIFICATIONS_ROUTE)
export class NotificationsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  @NotificationsInfinitySwagger()
  async getMyNotifications(@Query() query: GetMyNotificationsDto, @ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.queryBus.execute(new GetUserNotificationsInfinityQuery(dto.userId, query));
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  @MarkNotificationReadSwagger()
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markNotificationRead(@Param('id') id: string, @ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.commandBus.execute(new MarkNotificationReadCommand(dto.userId, id));
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  @MarkAllNotificationsReadSwagger()
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllNotificationsRead(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.commandBus.execute(new MarkAllNotificationsReadCommand(dto.userId));
  }
}
