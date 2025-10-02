import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  User as UserModel,
  PasswordRecovery as PasswordRecoveryModel,
} from '@prisma/client';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from './dto/create-user-confirmation.repo-dto';
import { UnauthorizedDomainException } from '../../../core/exceptions/domainException';

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

  async findByCode(code: string) {
    return this.prisma.userConfirmation.findFirst({
      where: { confirmationCode: code },
    });
  }

  async updateConfirm(
    userId: string,
    userConfirmationDto: CreateUserConfirmationRepoDto,
  ) {
    return this.prisma.userConfirmation.update({
      where: { userId },
      data: {
        confirmationCode: userConfirmationDto.confirmationCode,
        expirationDate: userConfirmationDto.expirationDate,
        isConfirmed: userConfirmationDto.isConfirmed,
      },
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

  async createOrUpdatePasswordRecovery(
    dto: PasswordRecoveryModel,
  ): Promise<void> {
    await this.prisma.passwordRecovery.upsert({
      where: { userId: dto.userId },
      update: dto,
      create: dto,
    });
  }

  async checkConfirmed(user: UserModel) {
    const confirmedUser = await this.prisma.userConfirmation.findFirst({
      where: { isConfirmed: true },
    });
    if (!confirmedUser) {
      throw UnauthorizedDomainException.create('Not exists user', 'user');
    }
    return true;
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

  async findUserConfirmationByRecoveryCode(recoveryCode: string) {
    return this.prisma.userConfirmation.findFirst({
      where: { confirmationCode: recoveryCode },
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
