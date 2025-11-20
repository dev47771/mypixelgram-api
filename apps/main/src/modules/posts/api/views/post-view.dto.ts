import { Post } from '@prisma/client';

class FilesType {
  url: string;
  fileId: string;
}

export class PostViewDto {
  description: string | null;
  location: string | null;
  files: FilesType[];

  static mapToView = (post: Post, dict: Record<string, string>): PostViewDto => {
    const dto = new PostViewDto();
    const ids: FilesType[] = post.fileIds.map((fileId: string) => {
      return {
        url: dict[fileId],
        fileId: fileId,
      };
    });
    dto.description = post.description;
    dto.location = post.location;
    dto.files = ids;

    return dto;
  };
}
