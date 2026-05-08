import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CodeDto {
  @ApiProperty({ type: CodeDto })
  @IsUUID()
  code: string;
}
