import { MailService } from '../../../src/core/mailModule/mail.service';

export class EmailServiceMock extends MailService {
  sendConfirmationEmail = jest
    .fn()
    .mockResolvedValue(
      console.log('EmailServiceMock sendConfirmationEmail called'),
    );
}
