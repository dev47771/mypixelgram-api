import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { BadRequestDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

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
        ErrorConstants.RECOVERY_CODE_INCORRECT,
        'SetNewPasswordUseCase',
      );

    if (new Date() > userWithRecoveryInfo.passwordRecoveryInfo!.expirationDate)
      throw BadRequestDomainException.create(
        ErrorConstants.RECOVERY_CODE_EXPIRED,
        'SetNewPasswordUseCase',
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
