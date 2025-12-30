import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageCompressionAndValidationPipe } from '../../../core/pipes/file-size-validation.pipe';
import { FILES_ROUTE } from '../domain/constants';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt.strategy';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractDeviceAndIpDto } from '../../user-accounts/api/input-dto/extract-device-ip.input-dto';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { FILE_FIELD_NAME, FILES_UPLOAD_LIMIT } from '../domain/file-upload.constants';
import { TransportService } from '../../transport/transport.service';
import { PayloadTypeDto } from './dto/payloadTypeDto';
import { FileType, InputFileType, UploadedFileInfo, UploadFilesResponse } from './dto/typeFile.enum';
import { UploadFilesSwagger } from '../decorators/files.swagger.decorators';
import { CommandBus } from '@nestjs/cqrs';
import { SetAvatarCommand } from '../application/set-avatar-url.use-case';

@Controller(FILES_ROUTE)
export class FilesController {
  constructor(
    private transportService: TransportService,
    private commandBus: CommandBus,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('upload-file')
  @UploadFilesSwagger()
  @UseInterceptors(FilesInterceptor(FILE_FIELD_NAME, FILES_UPLOAD_LIMIT))
  async uploadImages(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @UploadedFiles(ImageCompressionAndValidationPipe) files: Express.Multer.File[], @Body('type') type: FileType) {
    const payload: PayloadTypeDto = { userId: dto.userId, files, type: type };
    const res: UploadedFileInfo[] = await this.transportService.sendFilesForS3Upload(payload);
    if (type === FileType.AVATAR && res.length > 0) {
      await this.commandBus.execute(new SetAvatarCommand(dto.userId, { newAvatarUrl: res[0].url, fileId: res[0].fileId }));
    }
    return { data: res };
  }
}
