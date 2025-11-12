import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestPresentationalException } from '../exceptions/presentational/presentationalException';
import { BYTES_IN_MB, IMAGE_MAX_SIZE_MB } from '../../modules/files/domain/file-upload.constants';
import { ImageProcessingService } from '../../modules/files/application/image-processing.service';

@Injectable()
export class ImageCompressionAndValidationPipe implements PipeTransform {
  constructor(private readonly imageProcessingService: ImageProcessingService) {}

  async transform(files: Express.Multer.File[]) {
    const maxBytes = IMAGE_MAX_SIZE_MB * BYTES_IN_MB;
    const processedFiles: Express.Multer.File[] = [];

    for (const file of files) {
      if (file.size > maxBytes) {
        throw new BadRequestPresentationalException([{ field: file.fieldname, message: `File too large: ${file.originalname}. Maximum allowed size is ${IMAGE_MAX_SIZE_MB} MB.` }]);
      }
      let compressedBuffer: Buffer;
      try {
        compressedBuffer = await this.imageProcessingService.compress(file.buffer, file.mimetype);
      } catch (err) {
        throw new BadRequestPresentationalException([{ field: file.fieldname, message: err.message }]);
      }

      processedFiles.push({
        ...file,
        buffer: compressedBuffer,
        size: compressedBuffer.length,
      });
    }

    return processedFiles;
  }
}
