import { PrismaService } from '../../../../src/core/prisma/prisma.service';
import { UserConfirmation as UserConfirmationModel } from '@prisma/client';

export class UsersTestRepo {
  constructor(private prisma: PrismaService) {}

  async findUserConfirmationInfo(
    userId: string,
  ): Promise<UserConfirmationModel> {
    const userConfirmation: UserConfirmationModel | null =
      await this.prisma.userConfirmation.findFirst({
        where: { userId },
      });

    expect(userConfirmation).not.toBeNull();

    return userConfirmation!;
  }

  async assertUsersCount(expectedCount: number): Promise<void> {
    const actualCount = await this.prisma.user.count({
      where: { deletedAt: null },
    });
    expect(actualCount).toBe(expectedCount);
  }
}
