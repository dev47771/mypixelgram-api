import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';

export class GetTotalConfirmedUsersQuery {}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetTotalConfirmedUsersQuery)
export class GetTotalConfirmedUsersHandler
  implements IQueryHandler<GetTotalConfirmedUsersQuery, number>
{
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute(): Promise<number> {
    return this.usersQueryRepo.countConfirmed();
  }
}
