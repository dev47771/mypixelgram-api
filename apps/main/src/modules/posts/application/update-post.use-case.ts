import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputDto } from '../api/input-dto/post.input.dto';
import { PostsRepo } from '../infrastructure/post.repo';
import { ForbiddenDomainException, NotFoundDomainException } from '../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';
import { Post } from '@prisma/client';

export class UpdatePostCommand {
  constructor(
    public dto: PostInputDto,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
  constructor(private postRepo: PostsRepo) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post: Post | null = await this.postRepo.findById(command.postId);
    if (!post) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'UpdatePostUseCase');
    }
    if (post.userId !== command.userId) {
      throw ForbiddenDomainException.create(ErrorConstants.FORBIDDEN, 'UpdatePostUseCase');
    }
    const updated = await this.postRepo.updateLocationAndDescription(command.postId, command.dto.location, command.dto.description);
    if (!updated) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'UpdatePostUseCase');
    }
  }
}
