import { Controller } from '@nestjs/common';
import { Request } from 'express';

import { MessagePattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCheckoutPayload } from './input-dto';
import { CreateSubscriptionCheckoutCommand } from '../application/create-stripe-checkout.usecase';
import { GetUserPaymentsQuery } from '../application/get-user-payments.query-handler';
import { StripeWebhookService } from '../application/stripe-webhook.service';
import { CancelStripeSubscriptionCommand } from '../application/cancle-subscription.usecase';

@Controller()
export class PaymentApiController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly webhookService: StripeWebhookService,
  ) {}

  @MessagePattern({ cmd: 'createSubscriptionCheckout' })
  async createCheckout(payload: CreateCheckoutPayload) {
    console.log('here get message:  ', payload);
    return this.commandBus.execute(new CreateSubscriptionCheckoutCommand(payload.userId, payload.planId));
  }

  @MessagePattern({ cmd: 'getUserPayments' })
  async getUserPayments(data: { userId: string; page?: number; limit?: number }) {
    return this.queryBus.execute(new GetUserPaymentsQuery(data.userId, data.page, data.limit));
  }

  @MessagePattern({ cmd: 'handleStripeWebhook' })
  async handleStripeWebhook(payload: { rawBody: string; headers: Record<string, string> }) {
    console.log(`[PAYMENT TCP] Webhook: ${payload.rawBody.slice(0, 50)}...`);

    const fakeReq: Request = {
      body: payload.rawBody,
      headers: payload.headers,
      method: 'POST',
      url: '/stripe/webhook',
      header: (name: string) => payload.headers[name],
    } as Request;

    await this.webhookService.handle(fakeReq);

    return { success: true };
  }
  @MessagePattern({ cmd: 'cancelStripeSubscription' })
  async cancelSubscription(payload: { userId: string }) {
    return this.commandBus.execute(new CancelStripeSubscriptionCommand(payload.userId));
  }
}
