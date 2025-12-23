import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { Profile, User as UserModel } from '@prisma/client';

@Injectable()
export class UsersQueryRepo {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserViewDto | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: true,
      },
    });

    return user ? UserViewDto.mapToView(user) : null;
  }
  async countConfirmed(): Promise<number> {
    return this.prisma.userConfirmation.count({
      where: { isConfirmed: true },
    });
  }

  async findByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: { login, deletedAt: null },
      include: {
        profile: true,
      },
    });
  }
}
