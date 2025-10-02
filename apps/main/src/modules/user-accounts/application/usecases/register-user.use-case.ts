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
    console.log('[RegisterUserUseCase] input dto =', dto); // посмотреть, не пустой ли DTO [web:76][web:77][web:81]

    const user: CreateUserRepoDto = await this.createUser(dto);
    console.log('[RegisterUserUseCase] created user dto =', user); // должен содержать login/email/passwordHash и т.п. [web:76][web:77][web:81]

    const confirmationCode = generateConfirmationCode();
    console.log('[RegisterUserUseCase] confirmationCode =', confirmationCode); // отладка генерации кода [web:76][web:77][web:85]

    const codeLifetimeInSecs = this.configService.get<number>(
      'EMAIL_CONFIRMATION_CODE_LIFETIME_SECS',
    )!;
    console.log(
      '[RegisterUserUseCase] codeLifetimeInSecs =',
      codeLifetimeInSecs,
    ); // проверить подхват env и тип [web:81][web:90][web:87]

    const expirationDate = addSeconds(new Date(), codeLifetimeInSecs);
    console.log(
      '[RegisterUserUseCase] expirationDate =',
      expirationDate.toISOString(),
    ); // контроль расчёта даты [web:86][web:91][web:80]

    const userConfirmation: CreateUserConfirmationRepoDto = {
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    };
    console.log('[RegisterUserUseCase] userConfirmation =', userConfirmation); // полная структура перед сохранением [web:76][web:77][web:85]

    const createdUserId = await this.usersRepo.createUserWithConfirmation(
      user,
      userConfirmation,
    );
    console.log('[RegisterUserUseCase] createdUserId =', createdUserId); // убедиться, что insert прошёл [web:76][web:77][web:85]

    console.log('[RegisterUserUseCase] sendConfirmationEmail args =', {
      login: user.login,
      email: user.email,
      code: userConfirmation.confirmationCode,
    }); // лог параметров письма [web:76][web:77][web:85]

    this.mailService.sendConfirmationEmail(
      user.login,
      user.email,
      userConfirmation.confirmationCode,
    );

    return createdUserId;
  }
}
