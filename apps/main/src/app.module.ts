import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './core/exceptions/filters/http-exceptions.filter';
import { NotificationsModule } from './modules/notifications/notifications.module';

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
export class AppModule {}
