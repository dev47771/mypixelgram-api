import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';

export const correctUser: CreateUserInputDto = {
  login: 'user-test',
  email: 'user-test@mail.ru',
  password: 'pasS1234',
};
