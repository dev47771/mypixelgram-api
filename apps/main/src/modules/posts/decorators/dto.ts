import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Post } from '@prisma/client';

export class FileDto {
  @ApiProperty()
  url: string;
  @ApiProperty()
  fileId: string;
}

export class UserDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatar: string | null;
}

export class PostDto {
  @ApiProperty()
  postId: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ type: FileDto, isArray: true })
  file: FileDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class LastPostsResponseDto {
  @ApiProperty({ type: [PostDto] })
  posts: PostDto[];
}

export class PageInfoDto {
  @ApiProperty({
    description: 'Cursor of the last post in the current page or null if there is no next page',
    example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Indicates whether there is another page after this one',
    example: true,
  })
  hasMore: boolean;
}
export class PublicationViewDto {
  @ApiProperty({
    description: 'Post ID',
    example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
  })
  postId: string;

  @ApiProperty({
    description: 'URL of the first file in the post or null if there is no file',
    example: 'https://cdn.mypixelgram.com/files/123.png',
    nullable: true,
  })
  firstFileUrl: string | null;
}
export class UserPostsInfiniteResponseDto {
  @ApiProperty({
    type: [PublicationViewDto],
    description: 'List of user publications for the current page',
  })
  publications: PublicationViewDto[];

  @ApiProperty({
    type: PageInfoDto,
    description: 'Pagination info for infinite scroll',
  })
  pageInfo: PageInfoDto;
}

export class PostInputDto {
  @ApiProperty({
    description: 'New description of the post',
    example: 'Awesome sunset at the beach',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'New location of the post',
    example: 'Baku, Azerbaijan',
  })
  @IsString()
  location: string;
}

export class CreateInputDto {
  @ApiPropertyOptional({
    description: 'Post description',
    example: 'Awesome sunset at the beach',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Post location',
    example: 'Baku, Azerbaijan',
  })
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Array of file IDs that will be attached to the post',
    example: ['d9b2d63d-a233-4123-847a-7b3c3f3b9f1f'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  filesId: string[];
}

class FilesType {
  @ApiProperty({
    description: 'File URL',
    example: 'https://cdn.mypixelgram.com/files/123.png',
  })
  url: string;

  @ApiProperty({
    description: 'File ID',
    example: 'd9b2d63d-a233-4123-847a-7b3c3f3b9f1f',
  })
  fileId: string;
}

export class PostByUserIdViewDto {
  @ApiProperty({
    description: 'Post ID',
    example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
  })
  postId: string;

  @ApiProperty({
    description: 'Post description',
    example: 'Awesome sunset at the beach',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Post location',
    example: 'Baku, Azerbaijan',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Post creation date',
    example: '2025-11-22T18:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: [FilesType],
    description: 'List of attached files',
  })
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

class UserShortView {
  @ApiProperty({ description: 'User ID', example: 'c7e1b8e3-3d7f-4a9a-b2f1-8d2c5b4f9a10' })
  id: string;

  @ApiProperty({ description: 'User login', example: 'frontend_guy' })
  login: string;

  @ApiProperty({ description: 'User avatar URL or null', nullable: true, example: null })
  avatar: string | null;
}

export class PostByPostIdViewDto {
  @ApiProperty({
    description: 'Post ID',
    example: '65f4d9e2-3a3f-4c1e-9d78-6a81e8b2f9a1',
  })
  postId: string;

  @ApiProperty({ type: UserShortView })
  user: UserShortView;

  @ApiProperty({
    description: 'Post description',
    nullable: true,
    example: 'Awesome sunset at the beach',
  })
  description: string | null;

  @ApiProperty({
    description: 'Post location',
    nullable: true,
    example: 'Baku, Azerbaijan',
  })
  location: string | null;

  @ApiProperty({
    description: 'Total likes count',
    example: 99,
  })
  likesCount: number;

  @ApiProperty({
    description: 'Current user like status',
    example: 'None',
  })
  userLikeStatus: string;

  @ApiProperty({
    description: 'Post creation date',
    example: '2025-11-23T09:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Post last update date',
    example: '2025-11-23T10:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [FilesType],
    description: 'List of attached images',
  })
  images: FilesType[];
}
