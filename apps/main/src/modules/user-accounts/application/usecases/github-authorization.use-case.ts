import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { GithubUserAccounts } from '../../api/input-dto/github.user.dto';

export class GithubRegisterUseCaseCommand {
  constructor(public user: GithubUserAccounts) {}
}

@CommandHandler(GithubRegisterUseCaseCommand)
export class GithubRegisterUseCase
  implements ICommandHandler<GithubRegisterUseCaseCommand>
{
  constructor(private usersRepo: UsersRepo) {}

  async execute(command: GithubRegisterUseCaseCommand) {
    if (command.user.githubId) {
      //const checkEmail = await this.usersRepo.checkEmailInUserProvider(
      // command.user.email,
      //);
    }
  }
}
