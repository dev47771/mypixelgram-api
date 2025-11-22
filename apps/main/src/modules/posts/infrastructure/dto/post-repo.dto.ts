import { Post } from '@prisma/client';

export type CreatePostData = {
  location: string | null;
  description: string | null;
  filesId: string[];
  userId: string;
};
export type PostsPage = {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};
export const PAGE_SIZE = 8;
