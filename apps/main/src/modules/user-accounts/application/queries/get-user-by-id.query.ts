import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

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
        ErrorConstants.USER_NOT_FOUND,
        'GetUserById',
      );
    }
    return user;
  }
}
