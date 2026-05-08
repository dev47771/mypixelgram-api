import { ApiProperty } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';
export class ProfileUserViewDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'frontend_guy' })
  login: string;

  @ApiProperty({
    example: 'https://pixels.storage.yandexcloud.net/users/avatar.png',
    nullable: true,
  })
  avatar: string | null;
}
export class ProfileViewDto {
  @ApiProperty({ type: ProfileUserViewDto })
  user: ProfileUserViewDto;

  @ApiProperty({ example: 23 })
  publicationCount: number;

  @ApiProperty({ example: 120 })
  followers: number;

  @ApiProperty({ example: 87 })
  following: number;

  @ApiProperty({
    example: 'About me text',
    nullable: true,
  })
  description: string | null;
  static mapToView(user: UserModel & { profile?: { avatarUrl: string | null; aboutMe: string | null } }): ProfileViewDto {
    const dto = new ProfileViewDto();

    dto.user = {
      id: user.id,
      login: user.login,
      avatar: user.profile?.avatarUrl ?? null,
    };
    dto.publicationCount = this.getRandomInt(10, 50);
    dto.followers = this.getRandomInt(10, 50);
    dto.following = this.getRandomInt(10, 50);
    dto.description = user.profile?.aboutMe ?? null;
    return dto;
  }

  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

export class GetProfileOutputDto {
  @ApiProperty({
    description: 'User login',
    example: 'frontend_guy',
  })
  login: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Date of birth in ISO string format',
    example: '1999-04-20T00:00:00.000Z',
  })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Country',
    example: 'Azerbaijan',
    nullable: true,
    required: false,
  })
  country?: string | null;

  @ApiProperty({
    description: 'City',
    example: 'Baku',
    nullable: true,
    required: false,
  })
  city?: string | null;

  @ApiProperty({
    description: 'Short bio/about me',
    example: 'Full‑stack developer and football fan.',
    nullable: true,
    required: false,
  })
  aboutMe?: string | null;
  @ApiProperty({
    description: 'avatar url',
    example: 'https://pixels.storage.yandexcloud.net/users/b58a4b97-f7ba-4a5e-86c0-f27aa9919a51/1765453356602-0-Screenshot 2025-04-03 142814.png',
    nullable: true,
    required: false,
  })
  avatar?: string | null;
}
