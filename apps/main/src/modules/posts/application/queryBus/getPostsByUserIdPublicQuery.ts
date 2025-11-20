import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../../user-accounts/infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { TransportService } from '../../../transport/transport.service';
import { id } from 'date-fns/locale';
import { PostViewDto } from '../../api/views/post-view.dto';
import { DictPostsService } from '../../infrastructure/dictPostsService';

export class GetPostsByUserIdPublicCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetPostsByUserIdPublicCommand)
export class GetPostsByUserIdPublicQuery implements IQueryHandler<GetPostsByUserIdPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private dictService: DictPostsService,
  ) {}

  async execute({ userId }: GetPostsByUserIdPublicCommand): Promise<PostViewDto[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByUserIdPublic(userId);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user ${userId} not exist`, 'GetPostsByUserIdPublicQuery');
    }
    const dict: Record<string, string> = await this.dictService.getDictPosts(posts);
    return posts.map((post: Post) => PostViewDto.mapToView(post, dict));
  }
}
