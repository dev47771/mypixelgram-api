import { ApiProperty } from '@nestjs/swagger';

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
