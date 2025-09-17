import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './core/exceptions/filters/http-exceptions.filter';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    CqrsModule.forRoot(),
    UserAccountsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
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
