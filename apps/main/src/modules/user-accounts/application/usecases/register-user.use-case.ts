import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseCreateUser } from './common/base.create-user';
import { CryptoService } from '../crypto.service';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from '../../infrastructure/dto/create-user-confirmation.repo-dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../../../core/mailModule/mail.service';
import { generateConfirmationCode } from './common/confirmationCode.helper';
import { addSeconds } from 'date-fns/addSeconds';
import { SendEmailDto } from '../../api/input-dto/send.email.dto';

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
    const userDto: CreateUserRepoDto = await this.createUserDto(dto);

    const confirmationCode = generateConfirmationCode();

    const codeLifetimeInSecs = this.configService.get<number>(
      'EMAIL_CONFIRMATION_CODE_LIFETIME_SECS',
    )!;

    const expirationDate = addSeconds(new Date(), codeLifetimeInSecs);

    const userConfirmationDto: CreateUserConfirmationRepoDto = {
      confirmationCode,
      expirationDate,
      isConfirmed: false,
      isAgreeWithPrivacy: true,
    };
    console.log('userDto and userConfirmationDto', userDto, userConfirmationDto);
    const createdUserId = await this.usersRepo.createUserWithConfirmation(
      userDto,
      userConfirmationDto,
    );
console.log('createdUserId', createdUserId);
    const sendEmailDto: SendEmailDto = {
      login: userDto.login,
      email: userDto.email,
      code: confirmationCode,
    };

    await this.mailService.sendConfirmationEmail(sendEmailDto);

    return createdUserId;
  }
}
