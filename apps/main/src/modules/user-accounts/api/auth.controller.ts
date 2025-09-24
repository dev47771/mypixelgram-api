import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdOrInternalFailQuery } from '../application/queries/get-user-by-id-or-internal-fail.query';
import { RegisterUserCommand } from '../application/usecases/register-user.use-case';
import { LoginUserDto } from './input-dto/login-user.input-dto';
import { ExtractDeviceAndIpFromReq } from '../../../core/decorators/extractDeviceAndIp';
import { ExtractDeviceAndIpDto } from './input-dto/extract-device-ip.input-dto';
import { LoginUserCommand } from '../application/usecases/login-user.use-case';
import { LocalAuthGuard } from './guards/local-strategy/local-auth.guard';
import { Response } from 'express';
import { RefreshAuthGuard } from './guards/refresh-guard/refresh-auth.guard';
import { RefreshTokenPayloadDto } from '../sessions/api/dto/refresh-token-payload.dto';
import { ExtractRefreshFromCookie } from '../sessions/api/decorators/extract-refresh-from-coookie';
import { LogoutUseCaseCommand } from '../application/usecases/logout-user.use-case';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { RecoverPasswordCommand } from '../application/usecases/recover-password.use-case';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { SetNewPasswordCommand } from '../application/usecases/set-new-password.use-case';

export const AUTH_ROUTE = 'auth';

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: CreateUserInputDto): Promise<string> {
    return await this.commandBus.execute<RegisterUserCommand, string>(
      new RegisterUserCommand(body),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginDto: LoginUserDto,
    @ExtractDeviceAndIpFromReq() dto: ExtractDeviceAndIpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.commandBus.execute(new LoginUserCommand(dto));

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('recover-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommand(body.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    await this.commandBus.execute(
      new SetNewPasswordCommand(body.newPassword, body.recoveryCode),
    );
  }

  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto) {
    await this.commandBus.execute(new LogoutUseCaseCommand(payload));
  }
}
