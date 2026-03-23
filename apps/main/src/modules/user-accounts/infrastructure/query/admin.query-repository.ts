import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { GetUsersArgs, SortField, SortDirection } from '../../api/args/get-users.args';
import { UserModel as GraphQLUserModel, UserModel } from '../../../graph-ql/models/user.model';
import { UsersPage, USERS_PAGE_SIZE } from './dto/admin-query.dto';

@Injectable()
export class AdminQueryRepository {
  constructor(private prismaService: PrismaService) {}

  async findUsersWithPagination(query: GetUsersArgs): Promise<UsersPage> {
    const { cursor, searchLoginTerm, searchIdTerm, sortBy = SortField.CREATED_AT, sortDirection = SortDirection.DESC } = query;

    const where: any = {
      deletedAt: null,
    };

    // Поиск по логину (LIKE)
    if (searchLoginTerm) {
      where.login = {
        contains: searchLoginTerm,
        mode: 'insensitive',
      };
    }

    // Поиск по id (точное совпадение)
    if (searchIdTerm) {
      where.id = searchIdTerm;
    }

    // Определение сортировки
    const orderBy: any = {};
    if (sortBy === SortField.LOGIN) {
      orderBy.login = sortDirection;
    } else if (sortBy === SortField.ID) {
      orderBy.id = sortDirection;
    } else {
      orderBy.createdAt = sortDirection;
    }

    // Пагинация по курсору (infinity scroll) - берем на один элемент больше для определения hasMore
    const prismaUsers = await this.prismaService.user.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy,
      take: USERS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore: boolean = prismaUsers.length > USERS_PAGE_SIZE;
    const items = hasMore ? prismaUsers.slice(0, USERS_PAGE_SIZE) : prismaUsers;
    const lastItem = items[items.length - 1] ?? null;
    const nextCursor: string | null = lastItem ? lastItem.id : null;

    const users = items.map((user) => {
      const userModel = new UserModel();
      userModel.id = user.id;
      userModel.userId = user.id;
      userModel.login = user.login;
      userModel.email = user.email;
      userModel.createdAt = user.createdAt.toISOString();
      userModel.avatar = user.profile?.avatarUrl ?? null;
      userModel.dateOfBirth = user.profile?.dateOfBirth ? user.profile.dateOfBirth.toISOString() : null;
      userModel.accountType = user.accountType;

      if (user.planName && user.subscriptionExpiresAt) {
        userModel.currentSubscription = {
          planName: user.planName,
          expiresAt: user.subscriptionExpiresAt.toISOString(),
          nextPayment: user.subscriptionExpiresAt.toISOString(),
        };
      } else {
        userModel.currentSubscription = null;
      }

      return userModel;
    });

    return { users, nextCursor, hasMore };
  }

  async findByIdWithProfile(id: string): Promise<GraphQLUserModel | null> {
    const user = await this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }
    console.log('user', user);

    const userModel = new GraphQLUserModel();
    userModel.id = user.id;
    userModel.userId = user.id;
    userModel.login = user.login;
    userModel.email = user.email;
    userModel.createdAt = user.createdAt.toISOString();
    userModel.avatar = user.profile?.avatarUrl ?? null;
    userModel.dateOfBirth = user.profile?.dateOfBirth ? user.profile.dateOfBirth.toISOString() : null;
    userModel.accountType = user.accountType;

    if (user.planName && user.subscriptionExpiresAt) {
      userModel.currentSubscription = {
        planName: user.planName,
        expiresAt: user.subscriptionExpiresAt.toISOString(),
        nextPayment: user.subscriptionExpiresAt.toISOString(),
      };
    } else {
      userModel.currentSubscription = null;
    }

    return userModel;
  }
}
