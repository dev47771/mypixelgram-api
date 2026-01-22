import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../api/dto/typeFile.enum';

export class InputFileTypeDto {
  @ApiProperty({
    enum: FileType,
    description: 'Purpose of uploaded files',
    example: FileType.POST,
  })
  type: FileType;
}
export class UploadedFileViewDto {
  @ApiProperty({
    description: 'Public URL of uploaded file',
    example: 'https://pixels.storage.yandexcloud.net/users/709c05f2-8750-460a-814d-b15a378f9420/1763881662401-0-Screenshot-2025-04-03_15-33-14.png',
  })
  url: string;

  @ApiProperty({
    description: 'ID of uploaded file in FILES_API',
    example: 'b41accbd-cc3e-4d05-a9cd-33c2d62f2725',
  })
  fileId: string;
}
