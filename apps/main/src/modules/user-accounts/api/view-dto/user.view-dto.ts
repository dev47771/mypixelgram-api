import { User as UserModel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty()
  login: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty({ nullable: true, type: String })
  avatar: null;
  @ApiProperty()
  userId: string;

  static mapToView(user: UserModel): UserViewDto {
    const dto = new UserViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();
    dto.avatar = null;
    dto.userId = user.id;

    return dto;
  }
}
export class ViewTotalCountData {
  totalCount: number;
}
