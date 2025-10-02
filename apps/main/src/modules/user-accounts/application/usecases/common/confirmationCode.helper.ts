import { randomUUID } from 'node:crypto';

export function generateConfirmationCode(): string {
  const result_randomUUID = randomUUID();
  return result_randomUUID;
}
