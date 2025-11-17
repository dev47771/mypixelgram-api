import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsQueryRepo {
  constructor(private prisma: PrismaService) {}

  async findPostByIdView(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return null;

    return {
      description: post.description,
      filesId: post.fileIds,
      location: post.location,
    };
  }
}
