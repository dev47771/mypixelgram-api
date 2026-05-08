import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Sequelize } from 'sequelize-typescript';
import { PlanId, SubscriptionPlansService } from '../domain/plans.config';
import { SubscriptionStatus } from '../../models/subscription.model';
import { PaymentStatus } from '../../models/payment.model';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { PaymentRepo } from '../infrastructure/payment-repo';
import { StripeCheckoutService } from './stripe-checkout.service';
import { InjectConnection } from '@nestjs/sequelize';

export class CreateSubscriptionCheckoutCommand {
  constructor(
    public readonly userId: string,
    public readonly planId: PlanId,
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
    private readonly plansService: SubscriptionPlansService, // <-- инжектим
  ) {}

  async execute(command: CreateSubscriptionCheckoutCommand) {
    const { userId, planId } = command;

    const plan = this.plansService.getPlan(planId);

    return this.sequelize.transaction(async (tx) => {
      const subscription = await this.subscriptionRepo.create(
        {
          userId,
          planId,
          planName: plan.id,
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
      console.log('stipe price id ', plan.stripePriceId);
      const session = await this.stripeService.createCheckoutSession({
        paymentId: payment.id,
        userId,
        stripePriceId: plan.stripePriceId,
      });

      return {
        paymentUrl: session.url,
      };
    });
  }
}
