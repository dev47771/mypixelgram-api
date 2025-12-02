import { User as UserModel, Profile } from '@prisma/client';
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

  static mapToView(user: UserModel & { profile: Profile | null }): UserViewDto {
    const dto = new UserViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();
    dto.avatar = user.profile?.avatarUrl ?? null;
    dto.userId = user.id;
    dto.dateOfBirth = user.profile?.dateOfBirth ? user.profile.dateOfBirth.toISOString() : null;
    return dto;
  }
}
export class ViewTotalCountData {
  totalCount: number;
}
