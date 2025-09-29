import { IsUUID } from 'class-validator';

export class CodeDto {
  @IsUUID()
  code: string;
}
