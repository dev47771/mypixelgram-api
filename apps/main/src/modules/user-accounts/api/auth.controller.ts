import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationUserDto } from './input-dto/register-user.input-dto';
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
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Recaptcha } from './decorators/recaptcha.decorators';
import { RecaptchaTokenDto } from './input-dto/recapctcha.dto';
import { AuthService } from '../application/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GithubRegisterUseCaseCommand } from '../application/usecases/github-authorization.use-case';
import { GithubInputDto } from './input-dto/githubInputDto';
import { GoogleRegistrationUseCaseCommand } from '../application/usecases/google-authorization.use-case';
import { ConfigService } from '@nestjs/config';

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private configService: ConfigService,

  ) {}

  @Post('register')
  //@UseGuards(RecaptchaGuard)
  @Registration()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: RegistrationUserDto): Promise<string> {
    return await this.commandBus.execute<RegisterUserCommand, string>(
      new RegisterUserCommand(body),
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    console.log('1111');
    const dto: GithubInputDto = {
      ip: req.ip,
      device: req.headers['user-agent'],
      githubId: req.user.githubId,
      login: req.user.username,
      email: req.user.email,
    };
    console.log('dto', dto);
    try {
      const result = await this.commandBus.execute(
        new GithubRegisterUseCaseCommand(dto),
      );

      // Здесь вы можете:
      // 1. Установить JWT токен в cookie
      // 2. Перенаправить на фронтенд с токеном
      // 3. Вернуть JSON ответ

      // Перенаправление на фронтенд с токеном
      //return res.redirect(
      //`http://localhost:3001/auth/success?token=${result.access_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`,
      // );
    } catch (error) {
      return res.redirect('http://localhost:3001/auth/error');
    }
  }

  @Post('recaptcha')
  @Recaptcha()
  @HttpCode(HttpStatus.OK)
  async recaptcha(@Body() body: RecaptchaTokenDto) {
    return;
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
      sameSite: 'none',
      maxAge: 3600_000,
    });
    return { accessToken: tokens.accessToken } as AccessToken;
  }

  @ApiCookieAuth('refreshToken')
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
      sameSite: 'none',
      maxAge: 3600_000,
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

  @ApiCookieAuth('refreshToken')
  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  @Logout()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@ExtractRefreshFromCookie() payload: RefreshTokenPayloadDto) {
    await this.commandBus.execute(new LogoutUseCaseCommand(payload));
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @GetUserAccounts()
  async getMe(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto) {
    return this.queryBus.execute(new GetMeUseCaseCommand(dto.userId));
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('Google OAuth redirect endpoint called');
    // Роут для редиректа на Google OAuth (ничего не возвращает)
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    console.log('Google OAuth callback endpoint called');

    if (!req.user) {
      console.warn('No user data received from Google OAuth');
      return res.redirect(<string>this.configService.get<string>('FRONT_SIGNIN_ERROR_URL'));
    }

    const dto = {
      googleId: req.user.googleId,
      email: req.user.email,
      login: req.user.username,
      ip: req.ip,
      device: req.headers['user-agent'],
    };

    console.log(`Google OAuth user data received: ${JSON.stringify(dto)}`);

    try {
      const result = await this.commandBus.execute(
        new GoogleRegistrationUseCaseCommand(dto),
      );
      console.log('GoogleRegistrationUseCaseCommand executed successfully');
      // Можно добавить редирект или другой ответ при успехе
    } catch (error) {
      console.error('Error executing GoogleRegistrationUseCaseCommand', error);
      return res.redirect(<string>this.configService.get<string>('FRONT_SIGNIN_ERROR_URL'));
    }
  }
}
