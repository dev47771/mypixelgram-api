import { Controller, Get, Param } from '@nestjs/common';
import { PUBLIC_POST_ROUTE } from '../../user-accounts/domain/constants';
import { GetPostByIdPublicSwagger, GetUserPostsPublicSwagger, LastPostsSwagger } from '../decorators/post.swagger.decorators';
import { PostsQueryRepo } from '../infrastructure/post-query.repo';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostsByUserIdPublicCommand } from '../application/queryBus/getPostsByUserIdQuery.public';
import { GetPostByPostIdPublicCommand } from '../application/queryBus/getPostByPostIdQuery.public';
import { GetLastsPostPublicCommand } from '../application/queryBus/getLastPostsPublicQuery';

@Controller(PUBLIC_POST_ROUTE)
export class PublicPostController {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private queryBus: QueryBus,
  ) {}
  @Get('last-posts')
  @LastPostsSwagger()
  async getLastPosts() {
    return await this.queryBus.execute(new GetLastsPostPublicCommand());
  }

  @Get('users/:userId')
  @GetUserPostsPublicSwagger()
  async getPostsByUserIdPublic(@Param('userId') userId: string) {
    return await this.queryBus.execute(new GetPostsByUserIdPublicCommand(userId));
  }

  @Get(':postId')
  @GetPostByIdPublicSwagger()
  async getPostByPostIdPublic(@Param('postId') postId: string) {
    return await this.queryBus.execute(new GetPostByPostIdPublicCommand(postId));
  }
}
