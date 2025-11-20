import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../api/views/post-view.dto';
import { Post } from '@prisma/client';
import { DictFilesService } from './dictFilesService';

@Injectable()
export class PostsQueryRepo {
  constructor(
    private prisma: PrismaService,
    private dictService: DictFilesService,
  ) {}

  async getPostViewById(postId: string) {
    const post: Post[] = await this.prisma.post.findMany({
      where: { id: postId },
    });
    const dictFiles: Record<string, string> = await this.dictService.getDictFiles(post);
    return post ? post.map((post: Post) => PostViewDto.mapToView(post, dictFiles)) : null;
  }

  async getPostByUserIdPublic(userId: string) {
    const posts: Post[] = await this.prisma.post.findMany({
      where: { userId: userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });
    return posts ? posts : null;
  }
}
