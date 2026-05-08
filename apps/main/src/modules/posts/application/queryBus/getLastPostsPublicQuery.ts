import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { DictFilesService } from '../../infrastructure/dictFilesService';
import { LastPostViewDto } from '../../api/views/last-post.view.dto';

export class GetLastsPostPublicCommand {
  constructor() {}
}

@QueryHandler(GetLastsPostPublicCommand)
export class GetLastPostPublicQuery implements IQueryHandler<GetLastsPostPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute(): Promise<LastPostViewDto[]> {
    const posts: Post[] | null = await this.postQueryRepo.getLastPosts();
    if (!posts || posts.length === 0) {
      return [];
    }
    const dictFiles: Record<string, string> = await this.dictFilesService.getDictFiles(posts);
    return posts.map((post: Post) => LastPostViewDto.mapToView(post, dictFiles));
  }
}
