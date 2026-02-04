import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CHECKOUT_MODE } from '../domain/PAYMENT-CONSTANTS';

@Injectable()
export class StripeCheckoutService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  async createCheckoutSession(params: { paymentId: number; userId: string; stripePriceId: string }) {
    return this.stripe.checkout.sessions.create({
      mode: CHECKOUT_MODE,
      success_url: process.env.PAYMENT_SUCCESS_URL,
      cancel_url: process.env.PAYMENT_ERROR_URL,
      metadata: {
        paymentId: String(params.paymentId),
      },
      line_items: [
        {
          price: params.stripePriceId,
          quantity: 1,
        },
      ],
    });
  }
  async cancelSubscription(stripeSubscriptionId: string) {
    console.log(`Subscription ID: ${stripeSubscriptionId}`);
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }
}
