import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { PostViewDto } from '../../api/views/post-view.dto';
import { DictFilesService } from '../../infrastructure/dictFilesService';

export class GetPostsByUserIdPublicCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetPostsByUserIdPublicCommand)
export class GetPostsByUserIdPublicQuery implements IQueryHandler<GetPostsByUserIdPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute({ userId }: GetPostsByUserIdPublicCommand): Promise<PostViewDto[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByUserIdPublic(userId);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user ${userId} not exist`, 'GetPostsByUserIdPublicQuery');
    }
    const dictFiles: Record<string, string> = await this.dictFilesService.getDictFiles(posts);
    return posts.map((post: Post) => PostViewDto.mapToView(post, dictFiles));
  }
}
