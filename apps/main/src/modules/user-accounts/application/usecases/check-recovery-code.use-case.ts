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
      await this.usersRepo.findUserConfirmationByRecoveryCode(recoveryCode);

    if (!userWithRecoveryInfo)
      throw BadRequestDomainException.create(
        'Recovery code is incorrect',
        'code',
      );

    console.log(
      'userWithRecoveryInfo.passwordRecoveryInfo!.expirationDate',
      userWithRecoveryInfo.expirationDate,
    );

    console.log('new Date() ', new Date());

    if (new Date() > userWithRecoveryInfo.expirationDate!) {
      console.log('!!!!!!!!!!!!!!!');
      throw BadRequestDomainException.create(
        'Recovery code is expired',
        'recoveryCode',
      );
    }

    return true;
  }
}
