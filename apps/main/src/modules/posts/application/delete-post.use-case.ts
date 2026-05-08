import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../infrastructure/post.repo';
import { TransportService } from '../../transport/transport.service';
import { Post } from '@prisma/client';
import { BadRequestDomainException, ForbiddenDomainException, NotFoundDomainException } from '../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postRepo: PostsRepo,
    private transportService: TransportService,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post: Post | null = await this.postRepo.findById(command.postId);
    if (!post) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'DeletePostUseCase');
    }
    if (post.userId !== command.userId) {
      throw ForbiddenDomainException.create(ErrorConstants.FORBIDDEN, 'DeletePostUseCase');
    }
    const resultsoftDeleteFilesByPost = await this.transportService.softDeleteFilesByPost(post.fileIds);
    if (!resultsoftDeleteFilesByPost) {
      throw BadRequestDomainException.create(ErrorConstants.FILE_ID_NOT_FOUND, 'DeletePostUseCase');
    }
    try {
      await this.postRepo.deletePost(command.postId);
    } catch (err) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'DeletePostUseCase');
    }
  }
}
