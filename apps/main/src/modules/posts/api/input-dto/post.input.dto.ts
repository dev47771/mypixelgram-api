import { IsArray, isArray, IsOptional, IsString } from 'class-validator';

export class PostInputDto {
  @IsString()
  description: string;
  @IsString()
  location: string;
}

export class CreateInputDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsArray()
  @IsString({ each: true })
  filesId: string[];
}
