export class ValidFileIdDto {
  filesId: string[];
  userId: string;
}
export class CreateCheckoutPayload {
  userId: string;
  planId: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}
