import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../api/views/post-view.dto';
import { Post } from '@prisma/client';
import { DictPostsService } from './dictPostsService';

@Injectable()
export class PostsQueryRepo {
  constructor(
    private prisma: PrismaService,
    private dictService: DictPostsService,
  ) {}

  async getPostViewById(postId: string) {
    const post: Post[] = await this.prisma.post.findMany({
      where: { id: postId },
    });
    const dict: Record<string, string> = await this.dictService.getDictPosts(post);
    return post ? post.map((post: Post) => PostViewDto.mapToView(post, dict)) : null;
  }

  async getPostByUserIdPublic(userId: string) {
    const posts: Post[] = await this.prisma.post.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });
    return posts ? posts : null;
  }
}
