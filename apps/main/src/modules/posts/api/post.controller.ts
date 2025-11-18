import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { POST_ROUTE } from '../../user-accounts/domain/constants';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt-auth.guard';
import { CreateInputDto, PostInputDto } from './input-dto/post.input.dto';
import { UpdatePostCommand } from '../application/update-post.use-case';
import { CreatePostCommand } from '../application/create-post.use-case';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { ExtractDeviceAndIpDto } from '../../user-accounts/api/input-dto/extract-device-ip.input-dto';
import { PostsQueryRepo } from '../infrastructure/post-query.repo';
import { DeletePostCommand } from '../application/delete-post.use-case';

@Controller(POST_ROUTE)
export class PostController {
  constructor(
    private commandBus: CommandBus,
    private postQueryRepo: PostsQueryRepo,
  ) {}
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async updatePostById(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Body() updatePostDto: PostInputDto, @Param('id') postId: string) {
    return this.commandBus.execute(new UpdatePostCommand(updatePostDto, postId, dto.userId));
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Body() createPostDto: CreateInputDto) {
    const postId = await this.commandBus.execute(new CreatePostCommand(createPostDto, dto.userId));
    return await this.postQueryRepo.getPostViewById(postId);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletedPostById(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @Param('id') postId: string) {
    return await this.commandBus.execute(new DeletePostCommand(postId, dto.userId));
  }
}
