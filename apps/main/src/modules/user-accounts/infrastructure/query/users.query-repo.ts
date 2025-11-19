import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { User as UserModel } from '@prisma/client';

@Injectable()
export class UsersQueryRepo {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserViewDto | null> {
    const user: UserModel | null = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    return user ? UserViewDto.mapToView(user) : null;
  }
  async countConfirmed(): Promise<number> {
    return this.prisma.userConfirmation.count({
      where: { isConfirmed: true },
    });
  }

  async findByLogin(login: string): Promise<UserModel | null> {
    return await this.prisma.user.findFirst({
      where: { login, deletedAt: null },
    });
  }
}
