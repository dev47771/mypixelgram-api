import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../crypto.service';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { BaseCreateUser } from './common/base.create-user';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  extends BaseCreateUser
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(cryptoService: CryptoService, usersRepo: UsersRepo) {
    super(cryptoService, usersRepo);
  }

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const user: CreateUserRepoDto = await this.createUser(dto);

    const userConfirmation: CreateUserConfirmationRepoDto = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
      isAgreeWithPrivacy: true,
    };

    return this.usersRepo.createUserWithConfirmation(user, userConfirmation);
  }
}
