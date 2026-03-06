import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../user-accounts/infrastructure/users.repo';
import { NotFoundDomainException } from '../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';
import { DeleteUserAvatarCommand } from '../../user-accounts/application/usecases/profiles/delete-user-avatar.use-case';
import { UploadedFileInfo } from '../api/dto/typeFile.enum';

export class SetAvatarCommand {
  constructor(
    public userId: string,
    public res: { fileId: string; newAvatarUrl: string },
  ) {}
}
@CommandHandler(SetAvatarCommand)
export class SetAvatarUrlUseCase implements ICommandHandler<SetAvatarCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({ userId, res }: SetAvatarCommand): Promise<void> {
    const user = await this.usersRepo.findByIdWithProfile(userId);

    if (!user || !user.profile) {
      throw NotFoundDomainException.create(ErrorConstants.USER_NOT_FOUND, 'SetAvatarUrlUseCase');
    }

    const oldAvatarUrl = user.profile.avatarUrl;
    const oldFileId = user.profile.fileId;

    if (oldAvatarUrl) {
      await this.commandBus.execute(new DeleteUserAvatarCommand(userId, oldFileId!));
    }
    await this.usersRepo.setProfileAvatarUrl(userId, res.newAvatarUrl, res.fileId);
  }
}
