import { IsString } from 'class-validator';

export class PostInputDto {
  @IsString()
  description: string;
  @IsString()
  location: string;
}
