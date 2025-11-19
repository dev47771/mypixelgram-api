import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../../user-accounts/infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';

export class GetPostsByUserIdPublicCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetPostsByUserIdPublicCommand)
export class GetPostsByUserIdPublicQuery implements IQueryHandler<GetPostsByUserIdPublicCommand> {
  constructor(private postQueryRepo: PostsQueryRepo) {}

  async execute({ userId }: GetPostsByUserIdPublicCommand): Promise<Post[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByUserIdPublic(userId);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user ${userId} not exist`, 'GetPostsByUserIdPublicQuery');
    }
    const postIds = posts.map((post) => post.fileIds);
    console.log('postIds', postIds);

    return posts;
  }
}
