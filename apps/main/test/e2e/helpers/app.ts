import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../src/modules/notifications/email.service';
import { appSetup } from '../../../src/setup/app.setup';
import { INestApplication } from '@nestjs/common';
import { EmailServiceMock } from '../mock/email-service.mock';
import { PrismaService } from '../../../src/core/prisma/prisma.service';

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
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  customBuilderSetup(testingModuleBuilder);

  const moduleFixture: TestingModule = await testingModuleBuilder.compile();

  const app = moduleFixture.createNestApplication();
  appSetup(app);
  await app.init();

  await clearDB(moduleFixture);

  return app;
};

export const clearDB = async (moduleFixture: TestingModule): Promise<void> => {
  const prisma = moduleFixture.get(PrismaService);

  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
        );
      } catch (error) {
        console.log(`Skipping ${tablename}`, error);
      }
    }
  }
};
