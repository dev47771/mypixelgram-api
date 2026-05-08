import { GetUsersArgs } from '../../api/args/get-users.args';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminQueryRepository } from '../../infrastructure/query/admin.query-repository';
import { UsersPageResponse, PageInfo } from '../../../graph-ql/models/users-page.model';
import { UsersPage } from '../../infrastructure/query/dto/admin-query.dto';

export class AdminGetUsersQuery {
  constructor(
    public query: GetUsersArgs,
    public userId?: string,
  ) {}
}

@QueryHandler(AdminGetUsersQuery)
export class AdminGetUsersQueryHandler implements IQueryHandler<AdminGetUsersQuery> {
  constructor(private adminQueryRepo: AdminQueryRepository) {}

  async execute(query: AdminGetUsersQuery): Promise<UsersPageResponse> {
    if (query.userId) {
      // поиск пользователя по id с профилем
      const user = await this.adminQueryRepo.findByIdWithProfile(query.userId);
      if (!user) {
        throw new Error('User not found');
      }
      // Для запроса конкретного пользователя возвращаем пагинированный ответ с одним пользователем
      const pageInfo: PageInfo = {
        pageNumber: 1,
        pageSize: 1,
        totalPages: 1,
        totalItems: 1,
      };
      return {
        users: [user],
        pageInfo,
      };
    }

    // поиск всех пользователей с фильтрацией, сортировкой и пагинацией
    const page: UsersPage = await this.adminQueryRepo.findUsersWithPagination(query.query);
    const pageInfo: PageInfo = {
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      totalPages: page.totalPages,
      totalItems: page.totalItems,
    };
    return {
      users: page.users,
      pageInfo,
    };
  }
}
