import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { GetUsersArgs, SortField, SortDirection } from '../../api/args/get-users.args';
import { UserModel } from '../../../graph-ql/models/user.model';
import { UsersPage, USERS_PAGE_SIZE } from './dto/admin-query.dto';

@Injectable()
export class AdminQueryRepository {
  constructor(private prismaService: PrismaService) {}

  async findUsersWithPagination(query: GetUsersArgs): Promise<UsersPage> {
    const { cursor, searchLoginTerm, searchIdTerm, sortBy = SortField.CREATED_AT, sortDirection = SortDirection.DESC } = query;

    const where: any = {
      deletedAt: null,
    };

    if (searchLoginTerm) {
      where.login = {
        contains: searchLoginTerm,
        mode: 'insensitive',
      };
    }

    if (searchIdTerm) {
      where.id = searchIdTerm;
    }

    const orderBy: any = {};
    if (sortBy === SortField.LOGIN) {
      orderBy.login = sortDirection;
    } else if (sortBy === SortField.ID) {
      orderBy.id = sortDirection;
    } else {
      orderBy.createdAt = sortDirection;
    }

    const prismaUsers = await this.prismaService.user.findMany({
      where,
      include: {
        profile: true,
        providers: true,
      },
      orderBy,
      take: USERS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore: boolean = prismaUsers.length > USERS_PAGE_SIZE;
    const items = hasMore ? prismaUsers.slice(0, USERS_PAGE_SIZE) : prismaUsers;
    const lastItem = items[items.length - 1] ?? null;
    const nextCursor: string | null = lastItem ? lastItem.id : null;

    const users = items.map((user) => UserModel.mapToView(user));

    return { users, nextCursor, hasMore };
  }

  async findByIdWithProfile(id: string): Promise<UserModel | null> {
    const user = await this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return UserModel.mapToView(user);
  }
}
