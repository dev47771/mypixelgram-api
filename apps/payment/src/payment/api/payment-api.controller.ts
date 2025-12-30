import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentModel, PaymentStatus } from '../../models/payment.model';
import { SubscriptionModel, SubscriptionStatus } from '../../models/subscription.model';

@Controller()
export class PaymentApiController {
  constructor(
    @InjectModel(PaymentModel)
    private readonly paymentModel: typeof PaymentModel,

    @InjectModel(SubscriptionModel)
    private readonly subscriptionModel: typeof SubscriptionModel,
  ) {}

  @MessagePattern({ cmd: 'ping' })
  async ping(data: string) {
    console.log('[PAYMENT] PING RECEIVED:', data);

    const subscription = await this.subscriptionModel.create({
      userId: 'test-user-1',
      planId: 'basic',
      planName: 'Basic Plan',
      priceCents: 999,
      status: SubscriptionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const payment = await this.paymentModel.create({
      userId: 'test-user-1',
      subscriptionId: subscription.id,
      provider: 'test',
      amountCents: 999,
      currency: 'USD',
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    } as any);

    return payment;
  }
}
