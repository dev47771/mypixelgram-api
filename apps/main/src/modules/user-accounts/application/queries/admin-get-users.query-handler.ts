import { GetUsersArgs } from '../../api/args/get-users.args';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class AdminGetUsersQuery {
  constructor(
    public query: GetUsersArgs,
    public userId?: string,
  ) {}
}

@QueryHandler(AdminGetUsersQuery)
export class AdminGetUsersQueryHandler implements IQueryHandler<AdminGetUsersQuery> {
  constructor() {}

  async execute(query: AdminGetUsersQuery) {
    if (query.userId) {
      //поиск пользователя по id
    }
    //поиск всех пользователей
  }
}
