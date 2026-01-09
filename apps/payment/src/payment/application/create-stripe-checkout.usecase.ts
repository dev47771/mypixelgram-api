import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Sequelize } from 'sequelize-typescript';
import { SUBSCRIPTION_PLANS } from '../domain/plans.config';
import { SubscriptionStatus } from '../../models/subscription.model';
import { PaymentStatus } from '../../models/payment.model';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { PaymentRepo } from '../infrastructure/payment-repo';
import { StripeCheckoutService } from './stripe-checkout.service';
import { InjectConnection } from '@nestjs/sequelize';

export class CreateSubscriptionCheckoutCommand {
  constructor(
    public readonly userId: string,
    public readonly planId: keyof typeof SUBSCRIPTION_PLANS,
  ) {}
}

@CommandHandler(CreateSubscriptionCheckoutCommand)
export class CreateSubscriptionCheckoutUseCase implements ICommandHandler<CreateSubscriptionCheckoutCommand> {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly subscriptionRepo: SubscriptionRepo,
    private readonly paymentRepo: PaymentRepo,
    private readonly stripeService: StripeCheckoutService,
  ) {}

  async execute(command: CreateSubscriptionCheckoutCommand) {
    const { userId, planId } = command;

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    return this.sequelize.transaction(async (tx) => {
      const subscription = await this.subscriptionRepo.create(
        {
          userId,
          planId,
          planName: planId,
          priceCents: plan.priceCents,
          status: SubscriptionStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tx,
      );

      const payment = await this.paymentRepo.create(
        {
          userId,
          subscriptionId: subscription.id,
          provider: 'stripe',
          amountCents: plan.priceCents,
          currency: 'USD',
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
        },
        tx,
      );

      const session = await this.stripeService.createCheckoutSession({
        paymentId: payment.id,
        amountCents: plan.priceCents,
      });

      return {
        paymentUrl: session.url,
      };
    });
  }
}
