import { Body, Controller, Delete, Get, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageCompressionAndValidationPipe } from '../../../core/pipes/file-size-validation.pipe';
import { FILES_ROUTE } from '../domain/constants';
import { JwtAuthGuard } from '../../user-accounts/api/guards/jwt-strategy/jwt.strategy';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractDeviceAndIpDto } from '../../user-accounts/api/input-dto/extract-device-ip.input-dto';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { FILE_FIELD_NAME, FILES_UPLOAD_LIMIT } from '../domain/file-upload.constants';
import { TransportService } from '../../transport/transport.service';

@Controller(FILES_ROUTE)
export class FilesController {
  constructor(private transportService: TransportService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('upload-file')
  @UseInterceptors(FilesInterceptor(FILE_FIELD_NAME, FILES_UPLOAD_LIMIT))
  async uploadImages(@ExtractUserFromRequest() dto: ExtractDeviceAndIpDto, @UploadedFiles(ImageCompressionAndValidationPipe) files: Express.Multer.File[]) {
    const payload = { userId: dto.userId, files };
    const res = await this.transportService.sendFilesForS3Upload(payload);
    return { data: res };
  }

  @Get('change')
  async changeFile() {
    return this.transportService.changeFile({ message: 'Проверка связи!' });
  }

  @Delete('files-delete')
  async deleteFile(@Body() filesId: string[]) {
    return this.transportService.deleteFiles(filesId);
  }
}
