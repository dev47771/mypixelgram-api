import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepo } from '../../infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export class GetLoginByRefreshTokenQueryCommand {
  constructor(public refreshToken: string) {}
}

@QueryHandler(GetLoginByRefreshTokenQueryCommand)
export class GetLoginByRefreshTokenUseCase implements IQueryHandler<GetLoginByRefreshTokenQueryCommand> {
  constructor(
    private queryRepo: UsersQueryRepo,
    protected configService: ConfigService,
  ) {}

  async execute(command: GetLoginByRefreshTokenQueryCommand) {
    console.log('hereeeeeee111');
    const payload = jwt.verify(command.refreshToken, this.configService.get<string>('JWT_SECRET_KEY')!) as { userId: string; deviceId: string; iat: number; exp: number };
    console.log('hereeeee');
    const user = await this.queryRepo.findById(payload.userId);
    if (!user) {
      throw NotFoundDomainException.create(ErrorConstants.USER_NOT_FOUND, 'GetLoginByRefreshTokenQueryCommand');
    }

    return user.login;
  }
}
