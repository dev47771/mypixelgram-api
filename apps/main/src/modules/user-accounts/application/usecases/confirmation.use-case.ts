import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

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
      throw BadRequestDomainException.create(
        ErrorConstants.CONFIRMATION_CODE_INVALID,
        'ConfirmationUseCase',
      );
    }
    if (userConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        ErrorConstants.USER_ALREADY_CONFIRMED_CODE,
        'ConfirmationUseCase',
      );
    }

    if (
      !userConfirmation.expirationDate ||
      userConfirmation.expirationDate < new Date()
    ) {
      throw BadRequestDomainException.create(
        ErrorConstants.CONFIRMATION_LINK_EXPIRED,
        'ConfirmationUseCase',
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
