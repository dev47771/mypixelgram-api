//import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TestingModule } from './modules/testing/testing.module';
import { AllHttpExceptionsFilter } from './core/exceptions/allExceptionFilter';
import { DomainHttpExceptionFilter } from './core/exceptions/domain/domainException.filter';
import { MailModule } from './core/mailModule/mail.module';
import { validate } from './core/env.validation';
import { envFilePaths } from './env-file-paths';
import { PresentationalHttpExceptionFilter } from './core/exceptions/presentational/presentationalExceptionFilter';
import { PostModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePaths,
      validate,
      isGlobal: true,
    }),
    CoreModule,
    CqrsModule.forRoot(),
    UserAccountsModule,
    PostModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PresentationalHttpExceptionFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(configService: ConfigService): Promise<DynamicModule> {
    const imports: any[] = [];

    if (configService.get<boolean>('INCLUDE_TESTING_MODULE')) {
      imports.push(TestingModule);
    }

    return {
      module: AppModule,
      imports,
    };
  }
}
