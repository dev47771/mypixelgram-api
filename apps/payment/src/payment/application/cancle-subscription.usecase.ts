import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { StripeCheckoutService } from './stripe-checkout.service';
import { SubscriptionStatus } from '../../models/subscription.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class CancelStripeSubscriptionCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(CancelStripeSubscriptionCommand)
export class CancelStripeSubscriptionUseCase implements ICommandHandler<CancelStripeSubscriptionCommand> {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly subscriptionRepo: SubscriptionRepo,
    private readonly stripeService: StripeCheckoutService,
  ) {}

  async execute(command: CancelStripeSubscriptionCommand) {
    const { userId } = command;

    return this.sequelize.transaction(async (tx) => {
      const activeSub = await this.subscriptionRepo.findActiveByUserId(userId, tx);
      if (!activeSub || !activeSub.stripeSubscriptionId) {
        return { canceled: false };
      }

      await this.stripeService.cancelSubscription(activeSub.stripeSubscriptionId);

      await this.subscriptionRepo.updateStatus(activeSub.id, SubscriptionStatus.CANCELED, tx);

      return { canceled: true };
    });
  }
}
