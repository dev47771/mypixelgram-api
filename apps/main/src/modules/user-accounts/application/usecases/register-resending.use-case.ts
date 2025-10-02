import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';
import { MailService } from '../../../../core/mailModule/mail.service';
import { ConfigService } from '@nestjs/config';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';

export class RegistrationEmailResendingUseCaseCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingUseCaseCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingUseCaseCommand>
{
  constructor(
    private usersRepo: UsersRepo,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async execute(command: RegistrationEmailResendingUseCaseCommand) {
    const user = await this.usersRepo.findByEmail(command.email);
    if (!user)
      throw BadRequestDomainException.create(
        `user with email ${command.email} not exist`,
        'email',
      );

    const userConfirmation = await this.usersRepo.findUserConfirmationByUserId(
      user.id,
    );
    if (!userConfirmation)
      throw new InternalServerErrorException(
        `user with email ${command.email}  exists but confirmation data doesn't`,
        'email',
      );

    if (userConfirmation.isConfirmed) {
      throw BadRequestDomainException.create(
        'Such a user already exists',
        'email',
      );
    }
    const confirmationCode: string = uuidv4();

    const codeLifetimeInSecs = this.configService.get<number>(
      'EMAIL_CONFIRMATION_CODE_LIFETIME_SECS',
    )!;

    const expirationDate = add(new Date(), { seconds: codeLifetimeInSecs });

    const updatedConfirmationDto: CreateUserConfirmationRepoDto = {
      confirmationCode: confirmationCode,
      expirationDate: expirationDate,
      isConfirmed: false,
    };

    await this.usersRepo.updateConfirm(user.id, updatedConfirmationDto);

    this.mailService.sendConfirmationEmail(
      user.login,
      user.email,
      confirmationCode,
    );
    return;
  }
}
