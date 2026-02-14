import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

export class GetMeUseCaseCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMeUseCaseCommand)
export class GetMeUseCase implements IQueryHandler<GetMeUseCaseCommand> {
  constructor(private queryRepo: UsersQueryRepo) {}

  async execute(command: GetMeUseCaseCommand) {
    const user = await this.queryRepo.findById(command.userId);
    if (!user)
      throw NotFoundDomainException.create(
        ErrorConstants.USER_NOT_FOUND,
        'GetMeUseCaseCommand',
      );
    return user;
  }
}
