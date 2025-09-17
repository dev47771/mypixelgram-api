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

const queryHandlers = [
  GetUserByIdOrInternalFailQueryHandler,
  GetUserOrNotFoundFailQueryHandler,
];
const commandHandlers = [CreateUserUseCase, RegisterUserUseCase];
const commonProviders = [
  CryptoService,
  UsersRepo,
  UsersQueryRepo,
  BasicStrategy,
];

@Module({
  controllers: [UsersController, AuthController],
  providers: [...queryHandlers, ...commandHandlers, ...commonProviders],
})
export class UserAccountsModule {}
