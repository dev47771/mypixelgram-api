import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { GetUserByIdOrInternalFailQueryHandler } from './application/queries/get-user-by-id-or-internal-fail.query';
import { CreateUserUseCase } from './application/usecases/create-user.use-case';
import { CryptoService } from './application/crypto.service';
import { UsersRepo } from './infrastructure/users.repo';
import { UsersQueryRepo } from './infrastructure/query/users.query-repo';
import { RegisterUserUseCase } from './application/usecases/register-user.use-case';
import { AuthController } from './api/auth.controller';
import { GetUserOrNotFoundFailQueryHandler } from './application/queries/get-user-or-not-found-fail.query';
import { BasicStrategy } from './api/guards/basic/basic.strategy';
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
import {
  GetMeUseCase,
  GetMeUseCaseCommand,
} from './application/queries/get-me.query';
import { MailService } from '../../core/mailModule/mail.service';
import { ConfirmationUseCase } from './application/usecases/confirmation.use-case';
import { CheckRecoveryCodeUseCase } from './application/usecases/check-recovery-code.use-case';
import { RegistrationEmailResendingUseCase } from './application/usecases/register-resending.use-case';
import { RefreshTokenUseCase } from './application/usecases/create-new-tokens.use-case';

const queryHandlers = [
  GetUserByIdOrInternalFailQueryHandler,
  GetUserOrNotFoundFailQueryHandler,
  GetMeUseCase,
];
const commandHandlers = [
  CreateUserUseCase,
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
  RefreshTokenUseCase
];
const commonProviders = [
  CryptoService,
  UsersRepo,
  UsersQueryRepo,
  BasicStrategy,
  JwtStrategy,
  LocalStrategy,
  JwtService,
  SessionRepo,
  MailService,
];

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstraints.secret,
      signOptions: { expiresIn: '20m' },
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [...queryHandlers, ...commandHandlers, ...commonProviders],
})
export class UserAccountsModule {}
