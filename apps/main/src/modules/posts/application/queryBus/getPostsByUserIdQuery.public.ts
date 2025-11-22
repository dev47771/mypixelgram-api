import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { PostByUserIdViewDto } from '../../api/views/postByUserId-view.dto';
import { DictFilesService } from '../../infrastructure/dictFilesService';

export class GetPostsByUserIdPublicCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetPostsByUserIdPublicCommand)
export class GetPostsByUserIdQueryPublic implements IQueryHandler<GetPostsByUserIdPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute({ userId }: GetPostsByUserIdPublicCommand): Promise<PostByUserIdViewDto[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByUserIdPublic(userId);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user ${userId} not exist`, 'GetPostsByUserIdQueryPublic');
    }
    const dictFiles: Record<string, string> = await this.dictFilesService.getDictFiles(posts);
    return posts.map((post: Post) => PostByUserIdViewDto.mapToView(post, dictFiles));
  }
}
