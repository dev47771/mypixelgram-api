import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domainException';

export class GetUserByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserById
  implements IQueryHandler<GetUserByIdQuery, UserViewDto>
{
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ id }: GetUserByIdQuery): Promise<UserViewDto> {
    const user: UserViewDto | null = await this.usersQueryRepo.findById(id);
    if (!user) {
      throw NotFoundDomainException.create(
        'User does not exist',
        'get user by id',
      );
    }
    return user;
  }
}
