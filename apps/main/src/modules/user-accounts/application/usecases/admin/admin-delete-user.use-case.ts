import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../infrastructure/users.repo';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain/domainException';

export class AdminDeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(AdminDeleteUserCommand)
export class AdminDeleteUserUseCase implements ICommandHandler<AdminDeleteUserCommand> {
  constructor(private usersRepository: UsersRepo) {}

  async execute(command: AdminDeleteUserCommand) {
    const userId = command.userId;
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw NotFoundDomainException.create('User not found', 'AdminDeleteUserUseCase');
    }

    await this.usersRepository.deleteUser(userId);
  }
}
