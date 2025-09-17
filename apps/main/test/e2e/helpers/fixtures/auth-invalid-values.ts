import { getEncodedAdminCredentials } from '../auth.helper';

const encodedAdminCredentials = getEncodedAdminCredentials();

export const invalidBasicAuthHeaders = [
  '',
  'Basic somethingWeird',
  'Basic ',
  `Bearer ${encodedAdminCredentials}`,
  encodedAdminCredentials,
];
