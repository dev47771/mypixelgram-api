import { UserViewDto } from '../../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';

export function expectValidCreatedUser(
  createdUser: UserViewDto,
  inputDto: CreateUserInputDto,
): void {
  expect(createdUser.id).toEqual(expect.any(String));
  expect(createdUser.login).toBe(inputDto.login);
  expect(createdUser.email).toBe(inputDto.email);
  expect(createdUser.createdAt).toEqual(expect.any(String));
  expect(Date.parse(createdUser.createdAt)).not.toBeNaN();
}
