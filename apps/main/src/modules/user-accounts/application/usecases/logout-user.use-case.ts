import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { SessionRepo } from '../../sessions/infrastructure/sessions.repo';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenPayloadDto } from '../../sessions/api/dto/refresh-token-payload.dto';
import { Session } from '@prisma/client';
import { UnauthorizedDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';

export class LogoutUseCaseCommand {
  constructor(public payload: RefreshTokenPayloadDto) {}
}

@CommandHandler(LogoutUseCaseCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUseCaseCommand>
{
  constructor(
    protected configService: ConfigService,
    protected sessionRepo: SessionRepo,
  ) {}

  async execute(command: LogoutUseCaseCommand) {
    const session: Session | null = await this.sessionRepo.findByDeviceId(
      command.payload.deviceId,
    );
    if (!session) {
      throw UnauthorizedDomainException.create(
        ErrorConstants.SESSION_NOT_FOUND,
        'LogoutUserUseCase',
      );
    }
    await this.sessionRepo.deleteSession(session.id);
  }
}
