import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsQueryRepo {
  constructor(private prisma: PrismaService) {}

  async findPostById(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return null;

    return post;
  }
}
