import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users.repo';
import { PasswordRecovery as PasswordRecoveryModel } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';
import { MailService } from '../../../../core/mailModule/mail.service';
import { generateConfirmationCode } from './common/confirmationCode.helper';
import { addSeconds } from 'date-fns/addSeconds';

export class RecoverPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async execute({ email }: RecoverPasswordCommand): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user)
      throw BadRequestDomainException.create(
        'incorrect email address',
        'email',
      );

    const recoveryCodeHash = generateConfirmationCode();
    const expirationDate = addSeconds(
      new Date(),
      this.configService.get<number>('PASSWORD_RECOVERY_CODE_LIFETIME_SECS')!,
    );

    const passwordRecovery: PasswordRecoveryModel = {
      recoveryCodeHash,
      expirationDate,
      userId: user.id,
    };

    await this.usersRepo.createOrUpdatePasswordRecovery(passwordRecovery);

    this.mailService.sendUserRecoveryCode(
      user.login,
      user.email,
      recoveryCodeHash,
    );
  }
}
