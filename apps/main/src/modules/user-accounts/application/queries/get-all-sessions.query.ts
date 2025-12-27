import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { GetUserSessionsOutputDto, SessionViewDto } from '../../api/view-dto/session.view-dto';

export class GetUserSessionsQuery {
  constructor(
    public readonly userId: string,
    public readonly currentDeviceId: string,
  ) {}
}

@QueryHandler(GetUserSessionsQuery)
export class GetUserSessionsHandler implements IQueryHandler<GetUserSessionsQuery, GetUserSessionsOutputDto> {
  constructor(private usersQueryRepo: UsersQueryRepo) {}

  async execute(query: GetUserSessionsQuery): Promise<GetUserSessionsOutputDto> {
    const sessions = await this.usersQueryRepo.findSessionsByUserId(query.userId);

    return {
      sessions: sessions.map((s) => SessionViewDto.mapToView(s, query.currentDeviceId)),
    };
  }
}
