import { PaymentRepo } from '../infrastructure/payment-repo';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetUserPaymentsQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}

@QueryHandler(GetUserPaymentsQuery)
export class GetUserPaymentsQueryHandler implements IQueryHandler<GetUserPaymentsQuery> {
  constructor(private paymentRepo: PaymentRepo) {}

  async execute(query: GetUserPaymentsQuery) {
    const { userId, page, limit } = query;
    const offset = (page - 1) * limit;

    const payments = await this.paymentRepo.findByUserIdWithSubscription(userId, limit, offset);
    const total = await this.paymentRepo.countByUserId(userId);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
