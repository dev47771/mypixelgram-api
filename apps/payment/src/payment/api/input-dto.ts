export class CreateCheckoutPayload {
  userId: string;
  planId: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}
