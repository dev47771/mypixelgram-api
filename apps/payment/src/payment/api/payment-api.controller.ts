import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCheckoutPayload } from './input-dto';
import { CreateSubscriptionCheckoutCommand } from '../application/create-stripe-checkout.usecase';
import { GetUserPaymentsQuery } from '../application/get-user-payments.query-handler';

@Controller()
export class PaymentApiController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
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
}
