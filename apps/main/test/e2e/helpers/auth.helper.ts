import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/register-user.input-dto';

export const correctUser: CreateUserInputDto = {
  login: 'Klava009',
  email: 'al.humbatli@gmail.com',
  password: '1234Abc',
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
