import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { User as UserModel } from '@prisma/client';
import { ProfileViewDto } from '../../api/view-dto/profile-view.dto';

export class GetProfileByIdQuery {
  constructor(public login: string) {}
}

@QueryHandler(GetProfileByIdQuery)
export class GetProfileById implements IQueryHandler<GetProfileByIdQuery, ProfileViewDto | null> {
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ login }: GetProfileByIdQuery): Promise<ProfileViewDto | null> {
    const user: UserModel | null = await this.usersQueryRepo.findByLogin(login);
    if (!user) {
      throw NotFoundDomainException.create(`User ${login} doesn't exist`, 'GetProfileById');
    }
    return user ? ProfileViewDto.mapToView(user) : null;
  }
}
