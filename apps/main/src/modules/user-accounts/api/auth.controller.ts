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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DomainExeptionDto } from '../../../core/exceptions/domainException.dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { AccessToken } from './view-dto/access.token.dto';
import { object } from 'joi';

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Registration in the sistem',
    description:
      'Email with confirmation code will be send to passed qmail address',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param',
    example: 'https://mypixelgram.ru/confirm-registration?code=youtcodehere',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
    type: DomainExeptionDto,
  })
  @Post('registr')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: CreateUserInputDto): Promise<string> {
    return await this.commandBus.execute<RegisterUserCommand, string>(
      new RegisterUserCommand(body),
    );
  }

  @ApiOperation({
    summary: 'Registration in the sistem',
    description:
      'Email with confirmation code will be send to passed qmail address again',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param',
    example: 'https://mypixelgram.ru/confirmRegistration?code=youtcodehere',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has incorrect values or if email is already confirmed',
    type: DomainExeptionDto,
  })
  @Post('registration-email-resending')
  @ApiBody({ type: EmailDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() email: EmailDto) {
    await this.commandBus.execute(
      new RegistrationEmailResendingUseCaseCommand(email.email),
    );
    return;
  }

  @ApiOperation({
    summary: 'Confirm registration in the sistem',
    description: "Changing the user's status to confirmed",
  })
  @ApiResponse({
    status: 204,
    description: 'Email was verified. Account was activated',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    type: DomainExeptionDto,
  })
  @Post('registration-confirmation')
  @ApiBody({ type: CodeDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(@Body() code: CodeDto) {
    await this.commandBus.execute(new ConfirmationUseCaseCommand(code.code));
  }

  @ApiOperation({
    summary: 'Try login user tothe sistem',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)',
    type: AccessToken,
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: DomainExeptionDto,
  })
  @ApiResponse({
    status: 401,
    description: 'If the password or login is wrong',
  })
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

  @ApiOperation({
    summary: 'Password recovery via Email confirmation',
    description: 'Email should be sent with RecoveryCode inside',
  })
  @ApiResponse({
    status: 204,
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has invalid email, example: for example 222^gmail.com',
    type: DomainExeptionDto,
  })
  @Post('recover-password')
  @ApiBody({ type: EmailDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommand(body.email));
  }

  @ApiOperation({
    summary: 'Password recovery via Email confirmation again',
  })
  @ApiResponse({
    status: 204,
    description: 'Valid verification code, you can set a new password',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the recovery code is incorrect, expired or already been applied',
    type: DomainExeptionDto,
  })
  @Post('check-recovery-code')
  @ApiBody({ type: CodeDto })
  @HttpCode(HttpStatus.OK)
  async checkRecoveryCode(@Body() body: CodeDto): Promise<void> {
    await this.commandBus.execute(new CheckRecoveryCodeCommand(body.code));
  }

  @ApiOperation({
    summary: 'Confirm password recovery',
  })
  @ApiResponse({
    status: 204,
    description: 'If code is valid and new password is accepted',
  })
  @ApiResponse({
    status: 400,
    description:
      'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    type: DomainExeptionDto,
  })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: NewPasswordInputDto })
  async setNewPassword(@Body() body: NewPasswordInputDto): Promise<void> {
    await this.commandBus.execute(
      new SetNewPasswordCommand(body.newPassword, body.recoveryCode),
    );
  }

  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @UseGuards(RefreshAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Successfully logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto) {
    await this.commandBus.execute(new LogoutUseCaseCommand(payload));
  }

  @ApiOperation({
    summary: 'Get infirmation about current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.queryBus.execute(new GetMeUseCaseCommand(dto.userId));
  }
}
