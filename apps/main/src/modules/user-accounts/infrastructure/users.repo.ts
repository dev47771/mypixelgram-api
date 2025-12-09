import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { User as UserModel, PasswordRecovery as PasswordRecoveryModel, UserConfirmation } from '@prisma/client';
import { CreateUserRepoDto } from './dto/create-user.repo-dto';
import { CreateUserConfirmationRepoDto } from './dto/create-user-confirmation.repo-dto';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain/domainException';
import { UserProviderInputDto } from '../api/input-dto/user.provider.dto';
import { CreateOrUpdateProfileDto } from '../api/input-dto/create-or-update-profile.input-dto';
import { Profile } from 'passport';

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

  async findByGoogleId(googleId: string) {
    return this.prisma.userProvider.findFirst({
      where: { providerUserId: googleId },
    });
  }

  async findUserConfirmationByUserId(userId: string): Promise<UserConfirmation | null> {
    return this.prisma.userConfirmation.findFirst({
      where: { userId },
    });
  }

  async findUserAndProviderByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { providers: { some: { email } } }],
      },
      include: {
        providers: true,
      },
    });

    if (!user) return { user: null, provider: null };

    const provider = user.providers.find((p) => p.email === email);

    return { user, provider };
  }

  async updateConfirm(userId: string, userConfirmationDto: CreateUserConfirmationRepoDto) {
    return this.prisma.userConfirmation.update({
      where: { userId },
      data: {
        confirmationCode: userConfirmationDto.confirmationCode,
        expirationDate: userConfirmationDto.expirationDate,
        isConfirmed: userConfirmationDto.isConfirmed,
      },
    });
  }

  async createUserWithConfirmation(userDto: CreateUserRepoDto, confirmationDto: CreateUserConfirmationRepoDto): Promise<string> {
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

  async createOrUpdatePasswordRecovery(dto: PasswordRecoveryModel): Promise<void> {
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
      throw UnauthorizedDomainException.create(ErrorConstants.USER_NOT_CONFIRMED, 'UsersRepo');
    }
    return true;
  }

  async findUserByPasswordRecoveryCodeHash(recoveryCodeHash: string): Promise<(UserModel & { passwordRecoveryInfo: PasswordRecoveryModel | null }) | null> {
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

  async updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });
  }

  async findById(userId: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
  async findByIdWithProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
  async createUserConfirmationWithTrueFlag(userId: string, dto: CreateUserConfirmationRepoDto) {
    return this.prisma.userConfirmation.create({
      data: {
        userId,
        confirmationCode: dto.confirmationCode,
        expirationDate: dto.expirationDate,
        isConfirmed: dto.isConfirmed,
        isAgreeWithPrivacy: dto.isAgreeWithPrivacy, // если у тебя есть это поле
      },
    });
  }
  async createOrUpdateProfile(userId: string, dto: CreateOrUpdateProfileDto) {
    const dateOfBirth = new Date(dto.dateOfBirth);

    return this.prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth,
        country: dto.country,
        city: dto.city,
        aboutMe: dto.aboutMe,
        avatarUrl: dto.avatarUrl,
      },
      create: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth,
        country: dto.country ?? null,
        city: dto.city ?? null,
        aboutMe: dto.aboutMe ?? null,
        avatarUrl: dto.avatarUrl ?? null,
      },
    });
  }
  async setProfileAvatarUrl(userId: string, avatarUrl: string | null, fileId: string | null) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        avatarUrl,
        fileId,
      },
    });
  }
  async updateUserLogin(userId: string, newLogin: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { login: newLogin },
    });
  }
}
