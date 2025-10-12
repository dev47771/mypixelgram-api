import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestDomainException } from '../exceptions/domain/domainException';
import { SendEmailDto } from '../../modules/user-accounts/api/input-dto/send.email.dto';
import { ConfigService } from '@nestjs/config';
import { ErrorConstants } from '../exceptions/errorConstants';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    protected configService: ConfigService,
  ) {}

  async sendConfirmationEmail(sendEmailDto: SendEmailDto) {
    const { login, email, code } = sendEmailDto;
    const baseRegistrationUrl = this.configService.get('REGISTRATION_URL');
    const url = `${baseRegistrationUrl}?code=${code}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Добро пожаловать в mypixelgram, ${login}! Подтвердите регистрацию`,
        template: './registration',
        context: {
          login: login,
          url,
          code,
        },
      });
    } catch (e) {
      throw BadRequestDomainException.create(
        ErrorConstants.EMAIL_SEND_FAILED,
        'MailService',
      );
    }
  }

  async sendUserRecoveryCode(sendEmailDto: SendEmailDto) {
    const { login, email, code } = sendEmailDto;

    const baseRecoveryUrl = this.configService.get('RECOVERY_URL');
    const url = `${baseRecoveryUrl}?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Восстановление пароля в mypixelgram для пользователя ${login}`,
      template: './recoveryCode',
      context: {
        login: login,
        url,
        code,
      },
    });
  }
}
