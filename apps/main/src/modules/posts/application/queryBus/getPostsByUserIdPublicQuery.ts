import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';
import { UsersQueryRepo } from '../../../user-accounts/infrastructure/query/users.query-repo';
import { NotFoundDomainException } from '../../../../core/exceptions/domain/domainException';
import { ErrorConstants } from '../../../../core/exceptions/errorConstants';
import { Post } from '@prisma/client';
import { PostsQueryRepo } from '../../infrastructure/post-query.repo';
import { TransportService } from '../../../transport/transport.service';

export class GetPostsByUserIdPublicCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetPostsByUserIdPublicCommand)
export class GetPostsByUserIdPublicQuery implements IQueryHandler<GetPostsByUserIdPublicCommand> {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private transportService: TransportService,
  ) {}

  async execute({ userId }: GetPostsByUserIdPublicCommand): Promise<Post[]> {
    const posts: Post[] | null = await this.postQueryRepo.getPostByUserIdPublic(userId);
    if (!posts) {
      throw NotFoundDomainException.create(`Posts user ${userId} not exist`, 'GetPostsByUserIdPublicQuery');
    }
    const fileIds = posts.map((post) => post.fileIds);
    console.log('postIds', fileIds);

    const arrayFilesId = fileIds.reduce((acc, current) => acc.concat(current), []);
    console.log('arrayFilesIds', arrayFilesId);

    const files = await this.transportService.getFiles(arrayFilesId);
    console.log('files', files);

    return posts;
  }
}
