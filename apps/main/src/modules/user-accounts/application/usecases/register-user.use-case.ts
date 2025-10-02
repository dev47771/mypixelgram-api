import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BaseCreateUser } from './common/base.create-user';
import { CryptoService } from '../crypto.service';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../../../core/mailModule/mail.service';
import { generateConfirmationCode } from './common/confirmationCode.helper';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  extends BaseCreateUser
  implements ICommandHandler<RegisterUserCommand, string>
{
  constructor(
    cryptoService: CryptoService,
    usersRepo: UsersRepo,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    super(cryptoService, usersRepo);
  }

  async execute({ dto }: RegisterUserCommand): Promise<string> {
    const user: CreateUserRepoDto = await this.createUser(dto);

    const confirmationCode = generateConfirmationCode();

    const codeLifetimeInSecs = this.configService.get<number>(
      'EMAIL_CONFIRMATION_CODE_LIFETIME_SECS',
    )!;

    const expirationDate = add(new Date(), { seconds: codeLifetimeInSecs });

    const userConfirmation: CreateUserConfirmationRepoDto = {
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    };

    const createdUserId = await this.usersRepo.createUserWithConfirmation(
      user,
      userConfirmation,
    );

    await this.mailService.sendConfirmationEmail(
      user.login,
      user.email,
      userConfirmation.confirmationCode,
    );

    return createdUserId;
  }
}
