import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { DictFilesService } from '../../infrastructure/dictFilesService';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { PostByPostIdViewDto } from '../../api/views/postByPostId-view.dto';

export class GetPostByPostIdPublicCommand {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostByPostIdPublicCommand)
export class GetPostByPostIdQueryPublic implements IQueryHandler<GetPostByPostIdPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute({ postId }: GetPostByPostIdPublicCommand) {
    const post = await this.postQueryRepo.getPostById(postId);
    if (!post) {
      throw NotFoundDomainException.create(`Post user ${postId} not exist`, 'GetPostByPostIdQueryPublic');
    }
    const files: Record<string, string> = await this.dictFilesService.getDictFiles([post]);

    return PostByPostIdViewDto.mapToView(post, files);
  }
}
