import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundException } from '@nestjs/common';

export class GetUserOrNotFoundFailQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserOrNotFoundFailQuery)
export class GetUserOrNotFoundFailQueryHandler
  implements IQueryHandler<GetUserOrNotFoundFailQuery, UserViewDto>
{
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ id }: GetUserOrNotFoundFailQuery): Promise<UserViewDto> {
    return this.usersQueryRepo.findByIdOrNotFoundFail(id);
  }
}
