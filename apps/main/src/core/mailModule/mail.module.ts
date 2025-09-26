import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): MailerOptions => ({
        transport: {
          host: config.get<string>('MAIL_MODULE_HOST'),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_MODULE_USER'),
            pass: config.get<string>('MAIL_MODULE_PASSWORD'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_MODULE_FROM'),
        },
        template: {
          dir: join(__dirname, '/templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
