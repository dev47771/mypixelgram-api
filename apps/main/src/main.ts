import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  console.log(`main application started on port ${process.env.PORT}`);
  const DynamicAppModule = await AppModule.forRoot(configService);
  const app = await NestFactory.create(DynamicAppModule);
  app.use(
    bodyParser.raw({
      type: 'application/json',
      verify: (req, res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  await appContext.close();

  appSetup(app);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'main_events',
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT!);
  console.log(`main application started on port ${process.env.PORT}`);
}
bootstrap();
