import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { PaymentRepo } from '../infrastructure/payment-repo';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaymentStatus } from '../../models/payment.model';
import { SubscriptionStatus } from '../../models/subscription.model';
import { SUBSCRIPTION_PLANS } from '../domain/plans.config';
import { DEFAULT_PLAN_DAYS, MS_PER_DAY, SUBSCRIPTION_PURCHASED_EVENT } from '../domain/PAYMENT-CONSTANTS';

@Injectable()
export class StripeWebhookService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly paymentRepo: PaymentRepo,
    private readonly subscriptionRepo: SubscriptionRepo,
  ) {}

  async handle(req: Request) {
    const sig = req.headers['stripe-signature'];
    if (!sig) throw new Error('Missing stripe-signature');

    const event = this.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const paymentIdStr = session.metadata?.paymentId;
    const paymentId = Number(paymentIdStr);

    if (!paymentIdStr || isNaN(paymentId)) {
      return;
    }

    const paymentIntentId = session.payment_intent as string | null;

    await this.sequelize.transaction(async (tx) => {
      if (paymentIntentId) {
        await this.paymentRepo.attachStripeIntent(paymentId, paymentIntentId, tx);
      }

      await this.paymentRepo.updateStatus(paymentId, PaymentStatus.SUCCEEDED, tx);

      const payment = await this.paymentRepo.findById(paymentId, tx);
      if (!payment) {
        throw new Error(`Платеж не найден: ${paymentId}`);
      }

      const planDays = SUBSCRIPTION_PLANS[payment.subscription!.planName as keyof typeof SUBSCRIPTION_PLANS]?.days || DEFAULT_PLAN_DAYS;
      await this.subscriptionRepo.replaceActive(payment.userId, tx);
      await this.subscriptionRepo.activateById(payment.subscriptionId, tx, planDays);

      await this.subscriptionRepo.addOutboxEvent(
        payment.subscriptionId,
        SUBSCRIPTION_PURCHASED_EVENT,
        {
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          planName: payment.subscription!.planName,
          expiresAt: new Date(Date.now() + planDays * MS_PER_DAY).toISOString(),
        },
        tx,
      );
    });
  }
}
