import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../api/views/post-view.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostsQueryRepo {
  constructor(private prisma: PrismaService) {}

  async getPostViewById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    return post ? PostViewDto.mapToView(post) : null;
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
