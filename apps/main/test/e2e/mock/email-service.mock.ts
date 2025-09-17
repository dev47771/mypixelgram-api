import { EmailService } from '../../../src/modules/notifications/email.service';

export class EmailServiceMock extends EmailService {
  sendConfirmationEmail = jest.fn().mockResolvedValue(undefined);
}
