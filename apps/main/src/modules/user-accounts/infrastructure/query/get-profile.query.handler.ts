import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../users.repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';

export class GetUserProfileQuery {
  constructor(public userId: string) {}
}
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileUseCase implements IQueryHandler<GetUserProfileQuery> {
  constructor(private usersRepo: UsersRepo) {}

  async execute(query: GetUserProfileQuery) {
    const user = await this.usersRepo.findByIdWithProfile(query.userId);

    const profile = user?.profile;

    return {
      login: user?.login ?? null,

      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
      country: profile?.country ?? null,
      city: profile?.city ?? null,
      aboutMe: profile?.aboutMe ?? null,
    };
  }
}
