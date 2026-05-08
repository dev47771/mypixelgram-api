import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { SessionRepo } from '../../sessions/infrastructure/sessions.repo';

export class TerminateSessionByDeviceIdCommand {
  constructor(
    public readonly userId: string,
    public readonly currentDeviceId: string,
    public readonly targetDeviceId: string,
  ) {}
}
@CommandHandler(TerminateSessionByDeviceIdCommand)
export class TerminateSessionByDeviceIdHandler implements ICommandHandler<TerminateSessionByDeviceIdCommand> {
  constructor(private sessionRepo: SessionRepo) {}

  async execute(command: TerminateSessionByDeviceIdCommand): Promise<void> {
    const session = await this.sessionRepo.findByDeviceId(command.targetDeviceId);

    if (!session) {
      throw NotFoundDomainException.create(ErrorConstants.SESSION_NOT_FOUND, 'TerminateSessionByDeviceId');
    }

    if (session.userId !== command.userId) {
      throw ForbiddenDomainException.create(ErrorConstants.FORBIDDEN, 'TerminateSessionByDeviceId');
    }

    if (session.deviceId === command.currentDeviceId) {
      return;
    }

    await this.sessionRepo.deleteByDeviceId(command.targetDeviceId);
  }
}
