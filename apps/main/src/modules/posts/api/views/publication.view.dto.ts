import { Post } from '@prisma/client';
type MapToViewParams = {
  posts: Post[];
  dictFiles?: Record<string, string>;
  nextCursor: string | null;
  hasMore: boolean;
};
export type PublicationView = {
  postId: string;
  firstFileUrl: string | null;
};
export class UserPostsInfiniteResponse {
  publications: PublicationView[];
  pageInfo: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  static mapToView = ({ posts, dictFiles, nextCursor, hasMore }: MapToViewParams): UserPostsInfiniteResponse => {
    if (!posts.length) {
      return {
        publications: [],
        pageInfo: {
          nextCursor: null,
          hasMore: false,
        },
      };
    }
    const publications: PublicationView[] = posts.map((post) => {
      const firstFileId = post.fileIds?.[0];
      const firstFileUrl =
        firstFileId && dictFiles![firstFileId]
          ? dictFiles![firstFileId]
          : null;
      return {
        postId: post.id,
        firstFileUrl,
      };
    });
    return {
      publications,
      pageInfo: {
        nextCursor,
        hasMore,
      },
    };
  };
}
