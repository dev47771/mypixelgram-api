import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';

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
        'Recovery code is incorrect',
        'code',
      );

    if (new Date() > userWithRecoveryInfo.expirationDate) {
      throw BadRequestDomainException.create(
        'Recovery code is expired',
        'recoveryCode',
      );
    }

    return true;
  }
}
