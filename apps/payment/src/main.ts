import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PaymentApiModule } from './payment-api.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const isLocal = process.env.NODE_ENV === 'development.local';
  console.log('is local', isLocal, process.env.NODE_ENV);

  const microservicePort = isLocal ? process.env.PAYMENT_API_MICROSERVICE_PORT : Number(process.env.PAYMENT_TCP_PROD_PORT);
  console.log('[PAYMENT] TCP PORT:', microservicePort);
  const app = await NestFactory.create(PaymentApiModule);
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: microservicePort,
      host: '0.0.0.0',
    },
  });

  await app.init();

  await app.startAllMicroservices();
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);

  console.log(`payment application started on port ${port}`);
  console.log('[PAYMENT] TCP PORT:', microservicePort);
}
bootstrap();
