import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CHECKOUT_MODE, CURRENCY, LINE_ITEM_QUANTITY, PRODUCT_NAME } from '../domain/PAYMENT-CONSTANTS';

@Injectable()
export class StripeCheckoutService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  async createCheckoutSession(params: { paymentId: number; amountCents: number }) {
    return this.stripe.checkout.sessions.create({
      mode: CHECKOUT_MODE,
      success_url: process.env.PAYMENT_SUCCESS_URL,
      cancel_url: process.env.PAYMENT_ERROR_URL,
      metadata: {
        paymentId: String(params.paymentId),
      },
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            unit_amount: params.amountCents,
            product_data: {
              name: PRODUCT_NAME,
            },
          },
          quantity: LINE_ITEM_QUANTITY,
        },
      ],
    });
  }
}
