import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

export class CheckRecoveryCodeCommand {
  constructor(public recoveryCode: string) {}
}

@CommandHandler(CheckRecoveryCodeCommand)
export class CheckRecoveryCodeUseCase
  implements ICommandHandler<CheckRecoveryCodeCommand>
{
  constructor(private usersRepo: UsersRepo) {}

  async execute({ recoveryCode }: CheckRecoveryCodeCommand) {
    const userWithRecoveryInfo =
      await this.usersRepo.findUserRecoveryInfoByRecoveryCode(recoveryCode);

    if (!userWithRecoveryInfo)
      throw BadRequestDomainException.create(
        ErrorConstants.RECOVERY_CODE_INCORRECT,
        'CheckRecoveryCodeUseCase',
      );

    if (new Date() > userWithRecoveryInfo.expirationDate) {
      throw BadRequestDomainException.create(
        ErrorConstants.RECOVERY_CODE_EXPIRED,
        'CheckRecoveryCodeUseCase',
      );
    }

    return true;
  }
}
