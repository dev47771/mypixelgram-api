import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  User as UserModel,
  PasswordRecovery as PasswordRecoveryModel,
} from '@prisma/client';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from './dto/create-user-confirmation.repo-dto';

@Injectable()
export class UsersRepo {
  constructor(private prisma: PrismaService) {}

  async findByLogin(login: string): Promise<UserModel | null> {
    return this.prisma.user.findFirst({
      where: { login, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async createUserWithConfirmation(
    userDto: CreateUserRepoDto,
    confirmationDto: CreateUserConfirmationRepoDto,
  ): Promise<string> {
    const createdUser: UserModel = await this.prisma.user.create({
      data: {
        ...userDto,
        confirmationInfo: {
          create: {
            ...confirmationDto,
          },
        },
      },
    });

    return createdUser.id;
  }

  async createPasswordRecovery(dto: PasswordRecoveryModel): Promise<void> {
    await this.prisma.passwordRecovery.create({
      data: dto,
    });
  }

  async findUserByPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
  ): Promise<
    (UserModel & { passwordRecoveryInfo: PasswordRecoveryModel | null }) | null
  > {
    return this.prisma.user.findFirst({
      where: { passwordRecoveryInfo: { recoveryCodeHash } },
      include: { passwordRecoveryInfo: true },
    });
  }

  async deletePasswordRecoveryByUserId(userId: string): Promise<void> {
    await this.prisma.passwordRecovery.delete({ where: { userId } });
  }

  async updateUserPasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });
  }
}
