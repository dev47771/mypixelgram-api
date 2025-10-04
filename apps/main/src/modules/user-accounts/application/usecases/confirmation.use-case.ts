import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';

export class ConfirmationUseCaseCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmationUseCaseCommand)
export class ConfirmationUseCase
  implements ICommandHandler<ConfirmationUseCaseCommand>
{
  constructor(private usersRepo: UsersRepo) {}

  async execute(command: ConfirmationUseCaseCommand) {
    const userConfirmation = await this.usersRepo.findByCode(command.code);
    if (!userConfirmation) {
      console.log(
        'If the confirmation code is incorrect, expired or already been applied',
      );
      throw BadRequestDomainException.create(
        'If the confirmation code is incorrect, expired or already been applied',
        'code',
      );
    }
    if (userConfirmation.isConfirmed) {
      console.log('Such a user already exists');
      throw BadRequestDomainException.create(
        'Such a user already exists',
        'code',
      );
    }

    if (
      !userConfirmation.expirationDate ||
      userConfirmation.expirationDate < new Date()
    ) {
      console.log('The link in the email has expired');
      throw BadRequestDomainException.create(
        'The link in the email has expired',
        'ExpirationDate',
      );
    }

    const userConfirmationDto: CreateUserConfirmationRepoDto = {
      isConfirmed: true,
      expirationDate: null,
      confirmationCode: null,
      isAgreeWithPrivacy: true,
    };
    await this.usersRepo.updateConfirm(
      userConfirmation.userId,
      userConfirmationDto,
    );
  }
}
