import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Finish registration',
      template: 'confirm-email',
      context: {
        confirmationCode,
      },
    });
  }
}
