import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { PostByUserIdViewDto } from '../../api/views/postByUserId-view.dto';
import { DictFilesService } from '../../infrastructure/dictFilesService';

export class GetPostsByLoginPublicCommand {
  constructor(public login: string) {}
}

@QueryHandler(GetPostsByLoginPublicCommand)
export class GetPostsByLoginQueryPublic implements IQueryHandler<GetPostsByLoginPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictFilesService: DictFilesService,
  ) {}

  async execute({ login }: GetPostsByLoginPublicCommand): Promise<PostByUserIdViewDto[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByLoginPublic(login);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user with ${login} not exist`, 'GetPostsByLoginQueryPublic');
    }
    const dictFiles: Record<string, string> = await this.dictFilesService.getDictFiles(posts);
    return posts.map((post: Post) => PostByUserIdViewDto.mapToView(post, dictFiles));
  }
}
