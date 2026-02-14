import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { PaymentRepo } from '../infrastructure/payment-repo';
import { SubscriptionRepo } from '../infrastructure/subscription-repo';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaymentStatus } from '../../models/payment.model';
import { SubscriptionStatus } from '../../models/subscription.model';
import { DEFAULT_PLAN_DAYS, MS_PER_DAY, SUBSCRIPTION_PURCHASED_EVENT } from '../domain/PAYMENT-CONSTANTS';
import { PlanId, SubscriptionPlansService } from '../domain/plans.config';
import { NotificationPublisherService } from '../jobs/subscription.jobs';

@Injectable()
export class StripeWebhookService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly paymentRepo: PaymentRepo,
    private readonly subscriptionRepo: SubscriptionRepo,
    private readonly plansService: SubscriptionPlansService,
    private readonly notificationPublisherService: NotificationPublisherService,
  ) {}

  async handle(req: Request) {
    const sig = req.headers['stripe-signature'];
    if (!sig) throw new Error('Missing stripe-signature');
    const rawBodyStr = req.body as string;
    console.log('[SERVICE] raw length:', rawBodyStr.length);

    const event = this.stripe.webhooks.constructEvent(rawBodyStr, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log(' EVENT TYPE', event.type);
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.onInvoicePaid(event.data.object as any);
        break;

      case 'invoice.payment_failed':
      case 'payment_intent.payment_failed':
        await this.onFailedAutoPayment(event.data.object as any);
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
    const stripeCustomerId = session.customer as string | null;
    const stripeSubscriptionId = session.subscription as string | null;

    await this.sequelize.transaction(async (tx) => {
      if (paymentIntentId) {
        await this.paymentRepo.attachStripeIntent(paymentId, paymentIntentId, tx);
      }

      const payment = await this.paymentRepo.findById(paymentId, tx);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      await this.subscriptionRepo.attachStripeData(
        payment.subscriptionId,
        {
          stripeCustomerId: stripeCustomerId ?? undefined,
          stripeSubscriptionId: stripeSubscriptionId ?? undefined,
        },
        tx,
      );
    });
  }

  private async onInvoicePaid(invoice: any) {
    const stripeInvoiceId: string = invoice?.id;
    if (!stripeInvoiceId) return;

    const stripeSubscriptionId = this.getInvoiceSubscriptionId(invoice);
    console.log('[DEBUG] Stripe subscription id:', stripeSubscriptionId);

    if (!stripeSubscriptionId) {
      console.log('[WARN] Cannot determine subscription id from invoice', stripeInvoiceId);
      return;
    }

    await this.sequelize.transaction(async (tx) => {
      const already = await this.paymentRepo.findByStripeInvoiceId(stripeInvoiceId, tx);
      if (already) return;

      const sub = await this.subscriptionRepo.findByStripeSubscriptionId(stripeSubscriptionId, tx);
      if (!sub) {
        console.log('[WARN] Subscription not found for stripeSubscriptionId', stripeSubscriptionId);
        return;
      }
      console.log('Invoice paid for subscription:', sub.id, sub.planName);

      const amountCents: number = invoice?.amount_paid ?? 0;
      const currency: string = (invoice?.currency ?? 'usd').toUpperCase();

      await this.paymentRepo.createFromInvoice(
        {
          userId: sub.userId,
          subscriptionId: sub.id,
          amountCents,
          currency,
          status: PaymentStatus.SUCCEEDED,
          stripeInvoiceId,
        },
        tx,
      );

      const plan = this.plansService.getPlan(sub.planName as PlanId);
      const planDays = plan?.days ?? DEFAULT_PLAN_DAYS;

      await this.subscriptionRepo.replaceActive(sub.userId, tx);

      await this.subscriptionRepo.activateById(sub.id, tx, planDays);
      const expiresAt = new Date(Date.now() + planDays * MS_PER_DAY).toISOString();

      await this.subscriptionRepo.addOutboxEvent(
        sub.id,
        SUBSCRIPTION_PURCHASED_EVENT,
        {
          userId: sub.userId,
          subscriptionId: sub.id,
          planName: sub.planName,
          expiresAt: expiresAt,
          stripeInvoiceId,
        },
        tx,
      );
      const delayMs = this.calculateDelayForReminder(expiresAt);
      await this.notificationPublisherService.scheduleSubscriptionReminder(sub.userId, sub.id.toString(), sub.planName, expiresAt, delayMs);

      console.log(`[MAIN] Notification job scheduled for user ${sub.userId}, subscription ${sub.id}, delay ${delayMs}ms`);
    });
  }

  private async onFailedAutoPayment(invoice: any) {
    const stripeInvoiceId: string | undefined = invoice?.id;
    if (!stripeInvoiceId) return;

    const stripeSubscriptionId = this.getInvoiceSubscriptionId(invoice);

    await this.sequelize.transaction(async (tx) => {
      const sub = stripeSubscriptionId ? await this.subscriptionRepo.findByStripeSubscriptionId(stripeSubscriptionId, tx) : null;

      const userId: string = sub?.userId ?? invoice?.customer ?? 'unknown';
      const subscriptionId: number = sub?.id ?? 0;
      const planName: string = sub?.planName ?? 'unknown';

      const amountCents: number = invoice?.amount_due ?? 0;
      const currency: string = (invoice?.currency ?? 'usd').toUpperCase();

      if (sub) {
        await this.paymentRepo.createFromInvoice(
          {
            userId,
            subscriptionId: sub.id,
            amountCents,
            currency,
            status: PaymentStatus.FAILED,
            stripeInvoiceId,
          },
          tx,
        );

        await sub.update({ status: SubscriptionStatus.CANCELED }, { transaction: tx });
      }

      await this.subscriptionRepo.addOutboxEvent(
        subscriptionId,
        'subscription.payment_failed',
        {
          userId,
          subscriptionId,
          planName,
          stripeInvoiceId,
        },
        tx,
      );

      console.log('[DEBUG] Failed auto payment processed for', userId, subscriptionId);
    });
  }

  private getInvoiceSubscriptionId(invoice: any): string | null {
    if (typeof invoice?.subscription === 'string') return invoice.subscription;

    const lineSub = invoice?.lines?.data?.[0]?.parent?.subscription_item_details?.subscription;
    if (typeof lineSub === 'string') return lineSub;

    const parentSub = invoice?.parent?.subscription_details?.subscription;
    if (typeof parentSub === 'string') return parentSub;

    return null;
  }
  private calculateDelayForReminder(expiresAt: string, notifyBeforeMs = (23 * 60 + 59) * 60 * 1000): number {
    const expiresAtDate = new Date(expiresAt);
    const now = new Date();

    const delayMs = expiresAtDate.getTime() - now.getTime() - notifyBeforeMs;
    return Math.max(delayMs, 0);
  }
}
