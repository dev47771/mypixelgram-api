import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  User as UserModel,
  PasswordRecovery as PasswordRecoveryModel,
  UserConfirmation,
  UserProvider,
} from '@prisma/client';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from './dto/create-user-confirmation.repo-dto';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain/domainException';
import { RegistrationUserDto } from '../api/input-dto/register-user.input-dto';
import { UserProviderInputDto } from '../api/input-dto/user.provider.dto';

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

  async findProviderByEmail(email: string) {
    return this.prisma.userProvider.findFirst({
      where: { email },
    });
  }

  async findByCode(code: string) {
    return this.prisma.userConfirmation.findFirst({
      where: { confirmationCode: code },
    });
  }

  async findDataByGithubId(githubId: string) {
    return this.prisma.userProvider.findUnique({
      where: { providerUserId: githubId },
    });
  }

  async findUserConfirmationByUserId(
    userId: string,
  ): Promise<UserConfirmation | null> {
    return this.prisma.userConfirmation.findFirst({
      where: { userId },
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

  async createUserProvider(dto: UserProviderInputDto) {
    return await this.prisma.userProvider.create({
      data: dto,
    });
  }

  async checkEmailInUserProvider(email: string) {
    return await this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  async updateEmailInUserProvider(providerUserId: string, email: string) {
    return await this.prisma.userProvider.update({
      where: { providerUserId },
      data: { email },
    });
  }

  async checkConfirmed(user: UserModel) {
    const confirmedUser = await this.prisma.userConfirmation.findFirst({
      where: { isConfirmed: true },
    });
    if (!confirmedUser) {
      throw UnauthorizedDomainException.create(
        ErrorConstants.USER_NOT_CONFIRMED,
        'UsersRepo',
      );
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

  async findUserRecoveryInfoByRecoveryCode(recoveryCode: string) {
    return this.prisma.passwordRecovery.findFirst({
      where: { recoveryCodeHash: recoveryCode },
    });
  }

  async createUser(userDto: CreateUserRepoDto) {
    return this.prisma.user.create({
      data: {
        ...userDto,
      },
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
