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
}
