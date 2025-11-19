import { ApiProperty } from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';

export class ProfileViewDto {
  @ApiProperty()
  user: {
    id: string;
    login: string;
    avatar: string | null;
  };
  @ApiProperty()
  publicationCount: number;
  followers: number;
  following: number;
  description: string | null;

  static mapToView(profile: UserModel): ProfileViewDto {
    const dto = new ProfileViewDto();

    dto.user = {
      id: profile.id,
      login: profile.login,
      avatar: null,
    };
    dto.publicationCount = this.getRandomInt(10, 50);
    dto.followers = this.getRandomInt(10, 50);
    dto.following = this.getRandomInt(10, 50);
    dto.description = null;
    return dto;
  }

  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
