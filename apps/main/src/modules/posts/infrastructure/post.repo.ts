import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PostsRepo {
  constructor(private prisma: PrismaService) {}

  async findById(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
    });
  }

  async updateLocationAndDescription(postId: string, location: string, description: string) {
    const post = await this.findById(postId);
    if (!post) return null;

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        location,
        description,
      },
    });
  }
}
