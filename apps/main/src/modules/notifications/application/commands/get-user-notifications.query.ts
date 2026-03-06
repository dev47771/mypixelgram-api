import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationsQueryRepo } from '../../infrastructure/get-user-notifications.query-repo';
import { GetMyNotificationsDto } from '../../dto/get-notifications.input-dto';

export class GetUserNotificationsInfinityQuery {
  constructor(
    public readonly userId: string,
    public readonly query: GetMyNotificationsDto,
  ) {}
}

@QueryHandler(GetUserNotificationsInfinityQuery)
export class GetUserNotificationsInfinityHandler implements IQueryHandler<GetUserNotificationsInfinityQuery> {
  constructor(private readonly notificationsRepo: NotificationsQueryRepo) {}

  async execute(query: GetUserNotificationsInfinityQuery) {
    const { userId, query: dto } = query;
    const { cursor } = dto;

    return cursor ? this.notificationsRepo.getNextPage(userId, cursor) : this.notificationsRepo.getFirstPage(userId);
  }
}
