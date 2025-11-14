import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../infrastructure/post.repo';
import { NotFoundDomainException } from '../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';

export class DeletePostCommand {
  constructor(public postId: string) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepo: PostsRepo) {}

  async execute(command: DeletePostCommand) {
    const deleted = await this.postRepo.deletePost(command.postId);
    if (!deleted) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'deletePostUseCase');
    }
    return deleted;
  }
}
