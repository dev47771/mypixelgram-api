import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.use-case';
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
import { AUTH_ROUTE } from '../domain/constants';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { JwtAuthGuard } from './guards/jwt-strategy/jwt-auth.guard';
import { GetMeUseCaseCommand } from '../application/queries/get-me.query';
import { CodeDto } from './input-dto/code.dto';
import { ConfirmationUseCaseCommand } from '../application/usecases/confirmation.use-case';
import { CheckRecoveryCodeCommand } from '../application/usecases/check-recovery-code.use-case';
import { EmailDto } from './input-dto/email.resending.dto';
import { RegistrationEmailResendingUseCaseCommand } from '../application/usecases/register-resending.use-case';
import { AccessToken } from './view-dto/access.token.dto';
import {
  RegisterEmailResending,
  Registration,
  RegistrationConfirmation,
  Login,
  RecoverPassword,
  CheckRecoveryCode,
  SetNewPassword,
  Logout,
  GetUserAccounts,
  RefreshToken,
} from './decorators/auth.swagger.decorators';
import { RefreshTokenCommand } from '../application/usecases/create-new-tokens.use-case';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('registr')
  @Registration()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: CreateUserInputDto): Promise<string> {
    return await this.commandBus.execute<RegisterUserCommand, string>(
      new RegisterUserCommand(body),
    );
  }

  @Post('registration-email-resending')
  @RegisterEmailResending()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() email: EmailDto) {
    await this.commandBus.execute(
      new RegistrationEmailResendingUseCaseCommand(email.email),
    );
    return;
  }

  @Post('registration-confirmation')
  @RegistrationConfirmation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(@Body() code: CodeDto) {
    await this.commandBus.execute(new ConfirmationUseCaseCommand(code.code));
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Login()
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @ExtractDeviceAndIpFromReq() dto: ExtractDeviceAndIpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.commandBus.execute(new LoginUserCommand(dto));

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken } as AccessToken;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  @RefreshToken()
  @HttpCode(HttpStatus.OK)
  async createNewTokensPair(
    @ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair = await this.commandBus.execute(
      new RefreshTokenCommand(payload),
    );
    response.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return {
      accessToken: tokenPair.accessToken,
    };
  }

  @Post('recover-password')
  @RecoverPassword()
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommand(body.email));
  }

  @Post('check-recovery-code')
  @CheckRecoveryCode()
  @HttpCode(HttpStatus.OK)
  async checkRecoveryCode(@Body() body: CodeDto): Promise<void> {
    await this.commandBus.execute(new CheckRecoveryCodeCommand(body.code));
  }

  @Post('new-password')
  @SetNewPassword()
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    await this.commandBus.execute(
      new SetNewPasswordCommand(body.newPassword, body.recoveryCode),
    );
  }

  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  @Logout()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto) {
    await this.commandBus.execute(new LogoutUseCaseCommand(payload));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @GetUserAccounts()
  async getMe(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.queryBus.execute(new GetMeUseCaseCommand(dto.userId));
  }
}
