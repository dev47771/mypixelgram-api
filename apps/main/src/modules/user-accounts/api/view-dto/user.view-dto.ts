import { User as UserModel, Profile, AccountType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({
    description: 'User login',
    example: 'frontend_guy',
  })
  login: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account creation date in ISO format',
    example: '2025-12-02T12:34:56.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Avatar URL or null if user has no avatar',
    nullable: true,
    example: null,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'User ID',
    example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
  })
  userId: string;

  @ApiProperty({
    description: 'Date of birth in ISO format or null',
    nullable: true,
    example: null,
  })
  dateOfBirth: string | null;

  @ApiProperty({
    enum: AccountType,
    example: 'BUSINESS',
    default: 'PERSONAL',
  })
  accountType: AccountType;

  @ApiProperty({
    description: 'Current subscription info',
    nullable: true,
    example: {
      planName: 'YEAR',
      expiresAt: '2026-12-31T23:59:59.000Z',
      nextPayment: '2027-01-01T00:00:00.000Z',
    },
  })
  currentSubscription: {
    planName: string;
    expiresAt: string;
    nextPayment: string;
  } | null;

  static mapToView(user: UserModel & { profile: Profile | null }): UserViewDto {
    const dto = new UserViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();
    dto.avatar = user.profile?.avatarUrl ?? null;
    dto.userId = user.id;
    dto.dateOfBirth = user.profile?.dateOfBirth ? user.profile.dateOfBirth.toISOString() : null;
    dto.accountType = user.accountType;

    dto.currentSubscription =
      user.planName && user.subscriptionExpiresAt
        ? {
            planName: user.planName,
            expiresAt: user.subscriptionExpiresAt.toISOString(),
            nextPayment: user.subscriptionExpiresAt.toISOString(), // упрощённо
          }
        : null;
    return dto;
  }
}
export class ViewTotalCountData {
  @ApiProperty({
    description: 'Total number of confirmed users',
    example: 1523,
  })
  totalCount: number;
}
