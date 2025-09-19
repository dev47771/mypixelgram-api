import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { BadRequestException } from '@nestjs/common';

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
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    const userWithRecoveryInfo =
      await this.usersRepo.findUserByPasswordRecoveryCodeHash(recoveryCodeHash);

    if (!userWithRecoveryInfo) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is incorrect',
          },
        ],
      });
    }

    if (
      new Date() > userWithRecoveryInfo.passwordRecoveryInfo!.expirationDate
    ) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is expired',
          },
        ],
      });
    }

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
