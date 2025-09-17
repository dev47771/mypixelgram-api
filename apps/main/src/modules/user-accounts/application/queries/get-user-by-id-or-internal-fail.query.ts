import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';

export class GetUserByIdOrInternalFailQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserByIdOrInternalFailQuery)
export class GetUserByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetUserByIdOrInternalFailQuery, UserViewDto>
{
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ id }: GetUserByIdOrInternalFailQuery): Promise<UserViewDto> {
    return this.usersQueryRepo.findByIdOrInternalFail(id);
  }
}
