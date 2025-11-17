import { IsArray, isArray, IsString } from 'class-validator';

export class PostInputDto {
  @IsString()
  description: string;
  @IsString()
  location: string;
}

export class CreateInputDto {
  @IsString()
  description: string;
  @IsString()
  location: string;
  @IsArray()
  @IsString({ each: true })
  filesId: string[];
}
