import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PaymentApiModule } from './payment-api.module';
async function bootstrap() {
  const isLocal = process.env.NODE_ENV === 'development.local';

  const microservicePort = isLocal ? Number(process.env.PAYMENT_API_MICROSERVICE_PORT) : Number(process.env.PAYMENT_API_MICROSERVICE_PORT);
  const app = await NestFactory.create(PaymentApiModule);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: microservicePort, ...(isLocal ? {} : { host: '0.0.0.0' }) },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'payments_events',
    },
  });

  await app.startAllMicroservices();
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);

  console.log(`payment application started on port ${port}`);
}
bootstrap();
