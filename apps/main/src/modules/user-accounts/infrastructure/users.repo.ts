import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { User as UserModel } from '@prisma/client';
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

  async createUserWithConfirmation(userDto: CreateUserRepoDto, confirmationDto: CreateUserConfirmationRepoDto,): Promise<string> {
    // @ts-ignore
    const [{ current_database }] =
      await this.prisma.$queryRaw<{ current_database: string }[]>`SELECT current_database()`;
    const [{ current_schema }] =
      await this.prisma.$queryRaw<{ current_schema: string }[]>`SELECT current_schema()`;

    console.log(current_database, current_schema);

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
    console.log('createdUser', createdUser);
    const x = await this.prisma.user.findFirst()
    console.log('users in db', x);
    return createdUser.id;
  }
}
