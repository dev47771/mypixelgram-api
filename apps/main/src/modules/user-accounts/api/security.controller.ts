import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SECURITY_ROUTE } from '../domain/constants';
import { ApiCookieAuth } from '@nestjs/swagger';
import { GetUserSessionsQuery } from '../application/queries/get-all-sessions.query';
import { GetUserSessionsOutputDto } from './view-dto/session.view-dto';
import { RefreshAuthGuard } from './guards/refresh-guard/refresh-auth.guard';
import { ExtractRefreshFromCookie } from '../sessions/api/decorators/extract-refresh-from-coookie';
import { RefreshTokenPayloadDto } from '../sessions/api/dto/refresh-token-payload.dto';
import { GetUserSessionsSwagger, TerminateAllExceptCurrentSwagger, TerminateDeviceSessionSwagger } from './decorators/sessions.swagger.decorators';
import { TerminateSessionByDeviceIdCommand } from '../application/usecases/terminate-session-deviceId.use-case';
import { TerminateAllSessionsExceptCurrentCommand } from '../application/usecases/terminate-all-sessions-except-current.use-case';

@Controller(SECURITY_ROUTE)
export class SecurityController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshAuthGuard)
  @Get()
  @GetUserSessionsSwagger()
  @HttpCode(HttpStatus.OK)
  async getSessionsForCurrentUser(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto): Promise<GetUserSessionsOutputDto> {
    return this.queryBus.execute(new GetUserSessionsQuery(payload.userId, payload.deviceId));
  }
  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshAuthGuard)
  @Delete(':deviceId')
  @TerminateDeviceSessionSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateDeviceSession(@Param('deviceId') deviceId: string, @ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto): Promise<void> {
    await this.commandBus.execute(new TerminateSessionByDeviceIdCommand(payload.userId, payload.deviceId, deviceId));
  }

  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshAuthGuard)
  @Delete()
  @TerminateAllExceptCurrentSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllExceptCurrent(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto): Promise<void> {
    await this.commandBus.execute(new TerminateAllSessionsExceptCurrentCommand(payload.userId, payload.deviceId));
  }
}
