import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { DESCRIPT_BAD_REQUEST_UPLOAD_FILES, DESCRIPT_DESC_UPLOAD_FILES, DESCRIPT_HEAD_UPLOAD_FILES, DESCRIPT_SUCCESS_UPLOAD_FILES, DESCRIPT_UNAUTHORIZED_UPLOAD_FILES } from './files.constanst';
import { FileType } from '../api/dto/typeFile.enum';
import { FILE_FIELD_NAME } from '../domain/file-upload.constants';
import { DomainExceptionDto } from '../../../core/exceptions/domain/domainException.dto';
import { UploadedFileViewDto } from './dto';

export function UploadFilesSwagger() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: DESCRIPT_HEAD_UPLOAD_FILES,
      description: DESCRIPT_DESC_UPLOAD_FILES,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Multipart form. For type="post" you can send up to 10 images ' + '(field name: "post images"). For type="avatar" only the first image ' + 'will be used as avatar and previous avatar (if exists) will be deleted.',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: Object.values(FileType),
            example: FileType.POST,
          },
          [FILE_FIELD_NAME]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
    ApiOkResponse({
      description: DESCRIPT_SUCCESS_UPLOAD_FILES,
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: 'https://pixels.storage.yandexcloud.net/users/709c05f2-8750-460a-814d-b15a378f9420/1763881662401-0-Screenshot 2025-04-03 153314.png',
                },
                fileId: {
                  type: 'string',
                  example: 'b41accbd-cc3e-4d05-a9cd-33c2d62f2725',
                },
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: DESCRIPT_BAD_REQUEST_UPLOAD_FILES,
      type: DomainExceptionDto,
    }),
    ApiUnauthorizedResponse({
      description: DESCRIPT_UNAUTHORIZED_UPLOAD_FILES,
    }),
  );
}
