import { Post, User } from '@prisma/client';

class FilesType {
  url: string;
  fileId: string;
}

class UserPostType {
  userId: string;
  login: string;
  avatar: string | null;
}

export class LastPostViewDto {
  postId: string;
  description: string | null;
  location: string | null;
  file: FilesType[];
  user: UserPostType;
  createdAt: Date;

  static mapToView = (post, dictFiles: Record<string, string>): LastPostViewDto => {
    const dto = new LastPostViewDto();
    dto.postId = post.id;
    dto.description = post.description;
    dto.location = post.location;
    dto.createdAt = post.createdAt;

    dto.file = post.fileIds.map((fileId) => ({
      url: dictFiles[fileId],
      fileId,
    }));

    dto.user = {
      userId: post.userId,
      login: post.user.login,
      avatar: null,
    };

    return dto;
  };
}
