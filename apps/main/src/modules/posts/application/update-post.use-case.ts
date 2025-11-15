import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputDto } from '../api/input-dto/post.input.dto';
import { PostsRepo } from '../infrastructure/post.repo';
import { NotFoundDomainException } from '../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../core/exceptions/errorConstants';

export class UpdatePostCommand {
  constructor(
    public dto: PostInputDto,
    public postId: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
  constructor(private postRepo: PostsRepo) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const updated = await this.postRepo.updateLocationAndDescription(
      command.postId,
      command.dto.location,
      command.dto.description,
    );
    if (!updated) {
      throw NotFoundDomainException.create(ErrorConstants.POST_NOT_FOUND, 'UpdatePostUseCase');
    }
  }
}
