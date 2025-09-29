import { randomUUID } from 'node:crypto';

export function generateConfirmationCode(): string {
  return randomUUID();
}
