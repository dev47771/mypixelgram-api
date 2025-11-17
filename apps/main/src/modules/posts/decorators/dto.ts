import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty()
  url: string;
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

  @ApiProperty()
  file: FileDto;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class LastPostsResponseDto {
  @ApiProperty({ type: [PostDto] })
  posts: PostDto[];
}
