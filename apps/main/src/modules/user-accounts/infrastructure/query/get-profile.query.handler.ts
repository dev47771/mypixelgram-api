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
    if (!user || !user.profile) {
      throw NotFoundDomainException.create(`Profile with user ${user!.id} not exist`, 'GetUserProfileQuery');
    }

    return {
      login: user.login,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      dateOfBirth: user.profile.dateOfBirth.toISOString(),
      country: user.profile.country,
      city: user.profile.city,
      aboutMe: user.profile.aboutMe,
    };
  }
}
