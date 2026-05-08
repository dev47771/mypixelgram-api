import { Post } from '@prisma/client';

class FilesType {
  url: string;
  fileId: string;
}

export class PostByUserIdViewDto {
  postId: string;
  description: string | null;
  location: string | null;
  createdAt: Date;
  files: FilesType[];

  static mapToView = (post: Post, dictFiles: Record<string, string>): PostByUserIdViewDto => {
    const dto = new PostByUserIdViewDto();
    const ids: FilesType[] = post.fileIds.map((fileId: string) => {
      return {
        url: dictFiles[fileId],
        fileId: fileId,
      };
    });
    dto.postId = post.id;
    dto.description = post.description;
    dto.location = post.location;
    dto.createdAt = post.createdAt;
    dto.files = ids;

    return dto;
  };
}
