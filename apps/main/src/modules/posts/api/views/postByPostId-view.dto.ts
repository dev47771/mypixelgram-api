class FilesType {
  url: string;
  fileId: string;
}

export class PostByPostIdViewDto {
  postId: string;
  user: {
    id: string;
    login: string;
    avatar: null;
  };
  description: string | null;
  location: string | null;
  likesCount: number;
  userLikeStatus: string;
  createdAt: Date;
  updatedAt: Date;
  images: FilesType[];

  static mapToView = (post, dictFiles: Record<string, string>): PostByPostIdViewDto => {
    const dto = new PostByPostIdViewDto();
    const ids: FilesType[] = post.fileIds.map((fileId: string) => {
      return {
        url: dictFiles[fileId],
        fileId: fileId,
      };
    });
    dto.postId = post.id;
    dto.user = {
      id: post.userId,
      login: post.user.login,
      avatar: null,
    };
    dto.description = post.description;
    dto.location = post.location;
    dto.likesCount = 99;
    dto.userLikeStatus = 'None';
    dto.createdAt = post.createdAt;
    dto.updatedAt = post.updatedAt;
    dto.images = ids;

    return dto;
  };
}
