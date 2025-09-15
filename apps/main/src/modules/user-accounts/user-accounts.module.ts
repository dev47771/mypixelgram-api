import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { GetUserByIdOrInternalFailQueryHandler } from './application/queries/get-user-by-id-or-internal-fail.query';
import { CreateUserUseCase } from './application/usecases/create-user.use-case';
import { CryptoService } from './application/crypto.service';
import { UsersRepo } from './infrastructure/users.repo';
import { UsersQueryRepo } from './infrastructure/query/users.query-repo';

const queryHandlers = [GetUserByIdOrInternalFailQueryHandler];
const commandHandlers = [CreateUserUseCase];
const commonProviders = [CryptoService, UsersRepo, UsersQueryRepo];

@Module({
  controllers: [UsersController],
  providers: [...queryHandlers, ...commandHandlers, ...commonProviders],
})
export class UserAccountsModule {}
