import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';
import { ConfigService } from '@nestjs/config';
import { appSetup } from '../../../src/setup/app.setup';
import { INestApplication } from '@nestjs/common';
import { EmailServiceMock } from '../mock/email-service.mock';
import { MailService } from '../../../src/core/mailModule/mail.service';
import { deleteAllData } from './delete-all-data';

export class InitAppOptions {
  customBuilderSetup?: (builder: TestingModuleBuilder) => void;
}

export const initApp = async (
  options: InitAppOptions = {},
): Promise<INestApplication> => {
  const { customBuilderSetup = (builder: TestingModuleBuilder) => {} } =
    options;

  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get<ConfigService>(ConfigService);
  const DynamicAppModule = await AppModule.forRoot(configService);
  await appContext.close();

  const testingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(MailService)
    .useClass(EmailServiceMock);

  customBuilderSetup(testingModuleBuilder);

  const moduleFixture: TestingModule = await testingModuleBuilder.compile();

  const app = moduleFixture.createNestApplication();
  appSetup(app);
  await app.init();

  await deleteAllData(app);

  return app;
};
