import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { POST_ROUTE } from '../../user-accounts/domain/constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt-auth.guard';
import { CreateInputDto, PostInputDto } from './input-dto/post.input.dto';
import { UpdatePostCommand } from '../application/update-post.use-case';
import { CreatePostCommand } from '../application/create-post.use-case';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { ExtractDeviceAndIpDto } from '../../user-accounts/api/input-dto/extract-device-ip.input-dto';
import { PostsQueryRepo } from '../infrastructure/post-query.repo';
import { DeletePostCommand } from '../application/delete-post.use-case';
import { GetUserPostsWithInfinityPaginationPrivateCommand } from '../application/queryBus/getUserPostsInfinityScrollPrivateQuery';
import { GetMyPostsDto } from './input-dto/get-my-posts-query.input.dto';
import { CreatePostSwagger, DeletePostSwagger, MyPostsInfinitySwagger, UpdatePostSwagger } from '../decorators/post.swagger.decorators';

@Controller(POST_ROUTE)
export class PostController {
  constructor(
    private commandBus: CommandBus,
    private postQueryRepo: PostsQueryRepo,
    private queryBus: QueryBus,
  ) {}
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @UpdatePostSwagger()
  async updatePostById(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Body() updatePostDto: PostInputDto, @Param('id') postId: string) {
    return this.commandBus.execute(new UpdatePostCommand(updatePostDto, postId, dto.userId));
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @CreatePostSwagger()
  async createPost(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Body() createPostDto: CreateInputDto) {
    const postId = await this.commandBus.execute(new CreatePostCommand(createPostDto, dto.userId));
    return await this.postQueryRepo.getPostViewById(postId);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @DeletePostSwagger()
  async deletedPostById(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Param('id') postId: string) {
    return await this.commandBus.execute(new DeletePostCommand(postId, dto.userId));
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('my')
  @MyPostsInfinitySwagger()
  async getMyPosts(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Query() query: GetMyPostsDto) {
    return await this.queryBus.execute(new GetUserPostsWithInfinityPaginationPrivateCommand(dto.userId, query));
  }
}
