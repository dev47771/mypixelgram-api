import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailService } from './email.service';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './event-handlers/send-confirmation-email-when-user-registered.event-handler';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const transport = configService.get<string>('MAIL_TRANSPORT')!;
        const mailFromName = configService.get<string>('MAIL_FROM_NAME')!;
        const mailFromAddress = transport.split(':')[1].split('//')[1];

        return {
          transport,
          defaults: {
            from: `"${mailFromName}" <${mailFromAddress}>`,
          },
          template: {
            dir: __dirname + '/templates',
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [
    EmailService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
  ],
})
export class NotificationsModule {}
