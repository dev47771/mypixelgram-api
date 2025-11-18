import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { User as UserModel } from '@prisma/client';
import { ProfileViewDto } from '../../api/view-dto/profile-view.dto';

export class GetProfileByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetProfileByIdQuery)
export class GetProfileById implements IQueryHandler<GetProfileByIdQuery, ProfileViewDto | null> {
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ id }: GetProfileByIdQuery): Promise<ProfileViewDto | null> {
    const user: UserModel | null = await this.usersQueryRepo.findByIdRow(id);
    if (!user) {
      throw NotFoundDomainException.create(ErrorConstants.USER_NOT_FOUND, 'GetProfileById');
    }
    return user ? ProfileViewDto.mapToView(user) : null;
  }
}
