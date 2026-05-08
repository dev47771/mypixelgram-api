import { ApiProperty } from '@nestjs/swagger';

export class PaymentHistoryItemDto {
  @ApiProperty({ example: '122' })
  id: string;

  @ApiProperty({ example: '2026-01-08' })
  paymentDate: string;

  @ApiProperty({ example: '$99.99' })
  amount: string;

  @ApiProperty({ example: '2026-02-07' })
  endDate: string;

  @ApiProperty({ example: 'YEAR' })
  subscriptionType: string;

  @ApiProperty({ example: 'Stripe' })
  paymentType: string;
}

export class PaymentsResponseDto {
  @ApiProperty({ type: [PaymentHistoryItemDto] })
  payments: PaymentHistoryItemDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
