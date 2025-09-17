import { ADMIN_CREDENTIALS } from '../config/auth';

export function getEncodedAdminCredentials(): string {
  const { username, password } = ADMIN_CREDENTIALS;
  return Buffer.from(`${username}:${password}`).toString('base64');
}

export function getAdminBasicAuthHeader(): string {
  const token = getEncodedAdminCredentials();
  return `Basic ${token}`;
}
