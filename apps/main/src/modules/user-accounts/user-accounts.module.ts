import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { GetUserByIdOrInternalFailQueryHandler } from './application/queries/get-user-by-id-or-internal-fail.query';
import { CreateUserUseCase } from './application/usecases/create-user.use-case';
import { CryptoService } from './application/crypto.service';
import { UsersRepo } from './infrastructure/users.repo';
import { UsersQueryRepo } from './infrastructure/query/users.query-repo';
import { RegisterUserUseCase } from './application/usecases/register-user.use-case';
import { AuthController } from './api/auth.controller';

const queryHandlers = [GetUserByIdOrInternalFailQueryHandler];
const commandHandlers = [CreateUserUseCase, RegisterUserUseCase];
const commonProviders = [CryptoService, UsersRepo, UsersQueryRepo];

@Module({
  controllers: [UsersController, AuthController],
  providers: [...queryHandlers, ...commandHandlers, ...commonProviders],
})
export class UserAccountsModule {}
