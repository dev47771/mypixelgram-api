import { PaymentRepo } from '../infrastructure/payment-repo';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetAllPaymentsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}

@QueryHandler(GetAllPaymentsQuery)
export class GetAllPaymentsQueryHandler implements IQueryHandler<GetAllPaymentsQuery> {
  constructor(private paymentRepo: PaymentRepo) {}

  async execute(query: GetAllPaymentsQuery) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const payments = await this.paymentRepo.findAllWithPagination(limit, offset);
    const total = await this.paymentRepo.countAll();

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
