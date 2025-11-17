import { Post } from '@prisma/client';
type PostViewSource = Omit<Post, 'createdAt' | 'updatedAt' | 'id'>;

export class PostViewDto {
  description: string | null;
  filesId: string[];
  location: string | null;
  userId: string;

  static mapToView(post: PostViewSource): PostViewDto {
    const dto = new PostViewDto();
    dto.description = post.description!;
    dto.filesId = post.fileIds;
    dto.location = post.location!;
    return dto;
  }
}
