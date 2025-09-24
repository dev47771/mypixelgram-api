import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domainException';

export class GetMeUseCaseCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMeUseCaseCommand)
export class GetMeUseCase implements IQueryHandler<GetMeUseCaseCommand> {
  constructor(private queryRepo: UsersQueryRepo) {}

  async execute(command: GetMeUseCaseCommand) {
    const user = await this.queryRepo.findById(command.userId);
    if (!user)
      throw NotFoundDomainException.create('Not exsist user', 'gueryMe');
    return user;
  }
}
