import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { DictFilesService } from '../../infrastructure/dictFilesService';
import { GetMyPostsDto } from '../../api/input-dto/get-my-posts-query.input.dto';
import { UserPostsInfiniteResponse } from '../../api/views/publication.view.dto';

export class GetUserPostsWithInfinityPaginationPrivateCommand {
  constructor(
    public login: string,
    public query: GetMyPostsDto,
  ) {}
}

@QueryHandler(GetUserPostsWithInfinityPaginationPrivateCommand)
export class GetUserPostsWithInfinityPaginationPrivateQuery implements IQueryHandler<GetUserPostsWithInfinityPaginationPrivateCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute(command: GetUserPostsWithInfinityPaginationPrivateCommand) {
    const { login, query } = command;
    const { cursor } = query;

    const page = cursor ? await this.postQueryRepo.getUserPostsNextPage(login, cursor) : await this.postQueryRepo.getUserPostsFirstPage(login);

    const { posts, hasMore, nextCursor } = page;

    if (!posts.length) {
      return UserPostsInfiniteResponse.mapToView({
        posts,
        nextCursor,
        hasMore,
      });
    }

    const dictFiles = await this.dictFilesService.getDictFiles(posts);
    return UserPostsInfiniteResponse.mapToView({
      posts,
      dictFiles,
      nextCursor,
      hasMore,
    });
  }
}
