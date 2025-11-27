import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePostData } from './dto/post-repo.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostsRepo {
  constructor(private prisma: PrismaService) {}

  async findById(postId: string): Promise<Post | null> {
    return await this.prisma.post.findUnique({
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
  async createPost(data: CreatePostData): Promise<string> {
    const post = await this.prisma.post.create({
      data: {
        location: data.location ? data.location : null,
        description: data.description ? data.description : null,
        fileIds: data.filesId,
        userId: data.userId,
      },
    });
    return post.id;
  }

  async deletePost(postId: string) {
    await this.prisma.post.delete({
      where: { id: postId },
    });
  }
}
