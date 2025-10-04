import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User as UserModel } from '@prisma/client';
import { BadRequestDomainException } from '../../../../core/exceptions/domainException';
import { MailService } from '../../../../core/mailModule/mail.service';
import { ConfigService } from '@nestjs/config';
import { UserConfirmation } from '@prisma/client';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { SendEmailDto } from '../../api/input-dto/send.email.dto';
import { addSeconds } from 'date-fns/addSeconds';

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
    const user: UserModel | null = await this.usersRepo.findByEmail(
      command.email,
    );
    if (!user)
      throw BadRequestDomainException.create(
        `user with email ${command.email} not exist`,
        'email',
      );

    const userConfirmation: UserConfirmation | null =
      await this.usersRepo.findUserConfirmationByUserId(user.id);
    if (!userConfirmation)
      throw new InternalServerErrorException(
        `user with email ${command.email}  exists but confirmation data doesn't`,
        'email',
      );

    if (userConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('User already confirmed', 'email');
    }
    const confirmationCode: string = uuidv4();

    const codeLifetimeInSecs = this.configService.get<number>(
      'EMAIL_CONFIRMATION_CODE_LIFETIME_SECS',
    )!;

    const expirationDate = addSeconds(new Date(), codeLifetimeInSecs);

    const updatedConfirmationDto: CreateUserConfirmationRepoDto = {
      confirmationCode: confirmationCode,
      expirationDate: expirationDate,
      isConfirmed: false,
      isAgreeWithPrivacy: true,
    };

    await this.usersRepo.updateConfirm(user.id, updatedConfirmationDto);

    const sendEmailDto: SendEmailDto = {
      login: user.login,
      email: user.email,
      code: confirmationCode,
    };
    await this.mailService.sendConfirmationEmail(sendEmailDto);
    return;
  }
}
