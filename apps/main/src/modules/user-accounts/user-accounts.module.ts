import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { CryptoService } from './application/crypto.service';
import { UsersRepo } from './infrastructure/users.repo';
import { UsersQueryRepo } from './infrastructure/query/users.query-repo';
import { RegisterUserUseCase } from './application/usecases/register-user.use-case';
import { AuthController } from './api/auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstraints } from './domain/user-constraints';
import { LoginUserUseCase } from './application/usecases/login-user.use-case';
import { LocalStrategy } from './api/guards/local-strategy/local.strategy';
import { ValidateUserUseCase } from './application/usecases/validate-user.use-case';
import { SessionRepo } from './sessions/infrastructure/sessions.repo';
import { LogoutUserUseCase } from './application/usecases/logout-user.use-case';
import { RecoverPasswordUseCase } from './application/usecases/recover-password.use-case';
import { SetNewPasswordUseCase } from './application/usecases/set-new-password.use-case';
import { JwtStrategy } from './api/guards/jwt-strategy/jwt.strategy';
import { GetMeUseCase } from './application/queries/get-me.query';
import { MailService } from '../../core/mailModule/mail.service';
import { ConfirmationUseCase } from './application/usecases/confirmation.use-case';
import { CheckRecoveryCodeUseCase } from './application/usecases/check-recovery-code.use-case';
import { RegistrationEmailResendingUseCase } from './application/usecases/register-resending.use-case';
import { RefreshTokenUseCase } from './application/usecases/create-new-tokens.use-case';
import { RecaptchaService } from './application/recaptcha.service';
import { RecaptchaGuard } from './api/guards/recaptcha-guard/recaptcha.guard';
import { GetUserById } from './application/queries/get-user-by-id.query';
import { GitHubStrategy } from './api/guards/github-strategy/github.strategy';
import { GithubRegisterUseCase } from './application/usecases/github-authorization.use-case';
import { LoginGenerateService } from './application/login.generate.service';
import { GoogleStrategy } from './api/guards/google-strategy/google.strategy';
import { GoogleRegistrationUseCase } from './application/usecases/google-authorization.use-case';
import { GetTotalConfirmedUsersHandler } from './application/queries/get-total-confirmed-users.query';
import { PublicUsersController } from './api/public-users.controller';
import { GetProfileByLogin } from './application/queries/getProfileByLogin';
import { GetLoginByRefreshTokenUseCase } from './application/queries/get-user-login.outh2';
import { CreateOrUpdateUseCase } from './application/usecases/profiles/create-or-update-profile.use-case';
import { DeleteAvatarFileUseCase } from './application/usecases/profiles/delete-avatar-file.use-case';
import { DeleteUserAvatarUseCase } from './application/usecases/profiles/delete-user-avatar.use-case';
import { TransportModule } from '../transport/transport.module';
import { GetCountriesWithCitiesHandler } from './application/queries/get-countries-with-cities.query';
import { LocationsQueryRepo } from './infrastructure/query/locations-query.repo';
import { CacheModule } from '@nestjs/cache-manager';
import { GetUserProfileQuery, GetUserProfileUseCase } from './infrastructure/query/get-profile.query.handler';

const queryHandlers = [GetUserById, GetMeUseCase, GetTotalConfirmedUsersHandler, GetProfileByLogin, GetLoginByRefreshTokenUseCase, GetCountriesWithCitiesHandler, GetUserProfileUseCase];
const commandHandlers = [
  RegisterUserUseCase,
  LoginUserUseCase,
  ValidateUserUseCase,
  LogoutUserUseCase,
  ValidateUserUseCase,
  RecoverPasswordUseCase,
  SetNewPasswordUseCase,
  ConfirmationUseCase,
  CheckRecoveryCodeUseCase,
  RegistrationEmailResendingUseCase,
  RefreshTokenUseCase,
  GithubRegisterUseCase,
  GoogleRegistrationUseCase,
  CreateOrUpdateUseCase,
  DeleteAvatarFileUseCase,
  DeleteUserAvatarUseCase,
];
const commonProviders = [CryptoService, UsersRepo, UsersQueryRepo, JwtStrategy, LocalStrategy, JwtService, SessionRepo, MailService, RecaptchaService, RecaptchaGuard, GitHubStrategy, LoginGenerateService, GoogleStrategy, LocationsQueryRepo];

@Module({
  imports: [
    CacheModule.register({
      ttl: 30000,
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: jwtConstraints.secret,
      signOptions: { expiresIn: '20m' },
    }),
    TransportModule,
  ],
  controllers: [UsersController, AuthController, PublicUsersController],
  providers: [...queryHandlers, ...commandHandlers, ...commonProviders],
  exports: [JwtService, JwtStrategy, GetProfileByLogin, UsersRepo],
})
export class UserAccountsModule {}
