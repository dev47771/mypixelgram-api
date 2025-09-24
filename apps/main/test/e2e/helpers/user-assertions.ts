import { UserViewDto } from '../../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';

export function expectValidCreatedUser(
  createdUser: UserViewDto,
  inputDto: CreateUserInputDto,
): void {
  const dbConfirmationInfo: UserConfirmationModel =
    await usersTestRepo.findUserConfirmationInfo(createdUser.id);
  expect(dbConfirmationInfo.isConfirmed).toBe(true);
  expect(dbConfirmationInfo.confirmationCode).toBeNull();
  expect(dbConfirmationInfo.expirationDate).toBeNull();
}
