import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { GetUsersArgs, SortField, SortDirection } from '../../api/args/get-users.args';
import { UserModel } from '../../../graph-ql/models/user.model';
import { UsersPage } from './dto/admin-query.dto';

@Injectable()
export class AdminQueryRepository {
  constructor(private prismaService: PrismaService) {}

  async findUsersWithPagination(query: GetUsersArgs): Promise<UsersPage> {
    const { pageNumber = 1, pageSize = 8, searchLoginTerm, searchIdTerm, sortBy = SortField.CREATED_AT, sortDirection = SortDirection.DESC } = query;

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

    // Calculate offset
    const skip = (pageNumber - 1) * pageSize;

    // Get total count
    const totalItems = await this.prismaService.user.count({ where });

    // Get paginated users
    const prismaUsers = await this.prismaService.user.findMany({
      where,
      include: {
        profile: true,
        providers: true,
        blockInfo: true,
      },
      orderBy,
      take: pageSize,
      skip,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    const users = prismaUsers.map((user) => UserModel.mapToView(user));

    return {
      users,
      pageNumber,
      pageSize,
      totalPages,
      totalItems,
    };
  }

  async findByIdWithProfile(id: string): Promise<UserModel | null> {
    const user = await this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: true,
        providers: true,
        blockInfo: true,
      },
    });

    if (!user) {
      return null;
    }

    return UserModel.mapToView(user);
  }
}
