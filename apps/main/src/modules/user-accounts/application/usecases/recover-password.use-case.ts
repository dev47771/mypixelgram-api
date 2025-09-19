import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { randomBytes } from 'node:crypto';
import { CryptoService } from '../crypto.service';
import { PasswordRecovery as PasswordRecoveryModel } from '@prisma/client';
import { add } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { PasswordRecoveryRequestedEvent } from '../events/password-recovery-requested.event';
import { BadRequestException } from '@nestjs/common';

export class RecoverPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    private cryptoService: CryptoService,
    private configService: ConfigService,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: RecoverPasswordCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: "User with this email doesn't exist",
          },
        ],
      });
    }

    const recoveryCode = randomBytes(32).toString('hex');
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);
    const expirationDate = add(new Date(), {
      seconds: this.configService.get('PASSWORD_RECOVERY_CODE_LIFETIME_SECS'),
    });

    const passwordRecovery: PasswordRecoveryModel = {
      recoveryCodeHash,
      expirationDate,
      userId: user.id,
    };

    await this.usersRepo.createPasswordRecovery(passwordRecovery);

    this.eventBus.publish(
      new PasswordRecoveryRequestedEvent(email, recoveryCode),
    );
  }
}
