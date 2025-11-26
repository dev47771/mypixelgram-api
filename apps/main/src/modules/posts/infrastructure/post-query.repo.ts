import { PrismaService } from '../../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PostByUserIdViewDto } from '../api/views/postByUserId-view.dto';
import { Post } from '@prisma/client';
import { DictFilesService } from './dictFilesService';
import { PAGE_SIZE, PostsPage } from './dto/post-repo.dto';

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
    return post ? post.map((post: Post) => PostByUserIdViewDto.mapToView(post, dictFiles)) : null;
  }

  async getPostByLoginPublic(login: string) {
    const posts: Post[] = await this.prisma.post.findMany({
      where: {
        user: { login },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });
    return posts ? posts : null;
  }

  async getPostById(id: string) {
    return await this.prisma.post.findUnique({
      where: { id: id },
      include: {
        user: true,
      },
    });
  }
  async getLastPosts() {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
      include: {
        user: true,
      },
    });

    return posts.length > 0 ? posts : null;
  }

  async getUserPostsFirstPage(login: string): Promise<PostsPage> {
    const posts = await this.prisma.post.findMany({
      where: {
        user: {
          login,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
    });

    const hasMore: boolean = posts.length > PAGE_SIZE;
    const items: Post[] = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
    const lastItem: Post | null = items[items.length - 1] ?? null;
    const nextCursor: string | null = lastItem ? lastItem.id : null;

    return { posts: items, nextCursor, hasMore };
  }
  async getUserPostsNextPage(login: string, cursor: string): Promise<PostsPage> {
    const posts = await this.prisma.post.findMany({
      where: {
        user: {
          login,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
      cursor: { id: cursor },
      skip: 1,
    });

    const hasMore: boolean = posts.length > PAGE_SIZE;
    const items: Post[] = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
    const lastItem: Post | null = items[items.length - 1] ?? null;
    const nextCursor: string | null = lastItem ? lastItem.id : null;

    return { posts: items, nextCursor, hasMore };
  }
}
