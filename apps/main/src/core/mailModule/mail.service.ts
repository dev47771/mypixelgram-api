import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestDomainException } from '../exceptions/domainException';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(
    login: string,
    email: string,
    code: string | null,
  ) {
    const url = `https://some.com?code=${code}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Welcome to Nice App! Registration ${login}`,
        template: './registration',
        context: {
          login: login,
          url,
          code,
        },
      });
    } catch (e) {
      throw BadRequestDomainException.create('no exist email address', 'email');
    }

    await this.mailerService.sendMail({
      to: email,
      subject: `Welcome to Nice App! Registration ${login}`,
      template: './registration',
      context: {
        login: login,
        url,
        code,
      },
    });
  }

  async sendUserRecoveryCode(
    login: string,
    email: string,
    code: string | null,
  ) {
    const url = `https://some.com?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      subject: `Hello ${login}. This is recovery password`,
      template: './registration',
      context: {
        login: login,
        url,
        code,
      },
    });
  }
}
