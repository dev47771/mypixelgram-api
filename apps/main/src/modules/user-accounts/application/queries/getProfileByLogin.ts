import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { User as UserModel } from '@prisma/client';
import { ProfileViewDto } from '../../api/view-dto/profile-view.dto';

export class GetProfileByLoginQuery {
  constructor(public login: string) {}
}

@QueryHandler(GetProfileByLoginQuery)
export class GetProfileByLogin implements IQueryHandler<GetProfileByLoginQuery, ProfileViewDto | null> {
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute({ login }: GetProfileByLoginQuery): Promise<ProfileViewDto | null> {
    const user: UserModel | null = await this.usersQueryRepo.findByLogin(login);
    if (!user) {
      throw NotFoundDomainException.create(`User ${login} doesn't exist`, 'GetProfileByLogin');
    }
    return user ? ProfileViewDto.mapToView(user) : null;
  }
}
