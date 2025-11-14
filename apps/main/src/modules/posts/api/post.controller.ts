import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { POST_ROUTE } from '../../user-accounts/domain/constants';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt.strategy';
import { PostInputDto } from './input-dto/post.input.dto';
import { UpdatePostCommand } from '../application/update-post.use-case';
import { DeletePostCommand } from '../application/delete-post.use-case';

@Controller(POST_ROUTE)
export class PostController {
  constructor(private commandBus: CommandBus) {}
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async updatePostById(@Body() updatePostDto: PostInputDto, @Param('id') postId: string) {
    return this.commandBus.execute(new UpdatePostCommand(updatePostDto, postId));
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    return this.commandBus.execute(new DeletePostCommand(postId));
  }
}
