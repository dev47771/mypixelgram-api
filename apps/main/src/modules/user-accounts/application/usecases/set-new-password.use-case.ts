import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';

export class SetNewPasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase
  implements ICommandHandler<SetNewPasswordCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    private cryptoService: CryptoService,
  ) {}

  async execute({ newPassword, recoveryCode }: SetNewPasswordCommand) {
    const userWithRecoveryInfo =
      await this.usersRepo.findUserByPasswordRecoveryCodeHash(recoveryCode);

    if (!userWithRecoveryInfo)
      throw BadRequestDomainException.create(
        'Recovery code is incorrect',
        'code',
      );

    if (new Date() > userWithRecoveryInfo.passwordRecoveryInfo!.expirationDate)
      throw BadRequestDomainException.create(
        'Recovery code is expired',
        'recoveryCode',
      );

    await this.usersRepo.deletePasswordRecoveryByUserId(
      userWithRecoveryInfo.id,
    );

    const newPasswordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    await this.usersRepo.updateUserPasswordHash(
      userWithRecoveryInfo.id,
      newPasswordHash,
    );
  }
}
