import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransportService } from '../../../../transport/transport.service';
import { BadRequestDomainException } from '../../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../../core/exceptions/errorConstants';

export class DeleteAvatarFileCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteAvatarFileCommand)
export class DeleteAvatarFileUseCase implements ICommandHandler<DeleteAvatarFileCommand> {
  constructor(private transportService: TransportService) {}

  async execute(command: DeleteAvatarFileCommand): Promise<void> {
    if (!command.fileId) return;
    const result = await this.transportService.softDeleteFilesByPost([command.fileId]);
    if (!result) {
      throw BadRequestDomainException.create(ErrorConstants.FILE_ID_NOT_FOUND, 'DeleteAvatarFileUseCase');
    }
  }
}
