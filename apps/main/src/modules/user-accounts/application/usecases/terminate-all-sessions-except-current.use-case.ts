import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepo } from '../../sessions/infrastructure/sessions.repo';

export class TerminateAllSessionsExceptCurrentCommand {
  constructor(
    public readonly userId: string,
    public readonly currentDeviceId: string,
  ) {}
}
@CommandHandler(TerminateAllSessionsExceptCurrentCommand)
export class TerminateAllSessionsExceptCurrentHandler implements ICommandHandler<TerminateAllSessionsExceptCurrentCommand> {
  constructor(private sessionRepo: SessionRepo) {}

  async execute(command: TerminateAllSessionsExceptCurrentCommand): Promise<void> {
    await this.sessionRepo.deleteAllExceptDevice(command.userId, command.currentDeviceId);
  }
}
