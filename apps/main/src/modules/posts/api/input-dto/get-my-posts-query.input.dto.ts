import { IsOptional, IsUUID } from 'class-validator';

export class GetMyPostsDto {
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
