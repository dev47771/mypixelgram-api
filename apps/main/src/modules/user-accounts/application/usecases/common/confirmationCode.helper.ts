import { randomUUID } from 'node:crypto';

export function generateConfirmationCode(): string {
  const result_randomUUID = randomUUID();
  console.log('result_randomUUID', result_randomUUID);
  return result_randomUUID;
}
