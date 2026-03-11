import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../infrastructure/users.repo';
import { DeleteAvatarFileCommand } from './delete-avatar-file.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';

export class DeleteUserAvatarCommand {
  constructor(
    public userId: string,
    public fileId?: string, //делаю опциональным
  ) {}
}

@CommandHandler(DeleteUserAvatarCommand)
export class DeleteUserAvatarUseCase implements ICommandHandler<DeleteUserAvatarCommand> {
  constructor(
    private usersRepo: UsersRepo,
    private commandBus: CommandBus,
  ) {}

  async execute(command: DeleteUserAvatarCommand): Promise<void> {
    const user = await this.usersRepo.findByIdWithProfile(command.userId);
    if (!user || !user.profile) {
      throw NotFoundDomainException.create(ErrorConstants.USER_NOT_FOUND, 'DeleteUserAvatarUseCase');
    }
    const fileId = command.fileId ? command.fileId : user.profile.fileId;

    const avatarUrl = user.profile.avatarUrl;

    if (!avatarUrl) {
      return;
    }
    await this.commandBus.execute(new DeleteAvatarFileCommand(fileId!));

    await this.usersRepo.setProfileAvatarUrl(command.userId, null, null);
  }
}
