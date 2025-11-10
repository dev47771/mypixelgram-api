import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { log } from 'handlebars';
import { BadRequestPresentationalException } from '../exceptions/presentational/presentationalException';

@Injectable()
export class ImageCompressionAndValidationPipe implements PipeTransform {
  constructor(
    private readonly maxSizeInMb: number,
    private readonly quality: number = 70,
    private readonly allowedMimeTypes: string[] = ['image/jpeg', 'image/png'], // список разрешённых типов

  ) {}

  async transform(files: Express.Multer.File[]) {
    const maxBytes = this.maxSizeInMb * 1024 * 1024;
    const processedFiles: Express.Multer.File[] = [];

    for (const file of files) {
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestPresentationalException([ {
            field: `${file.fieldname}`,
            message: `Unsupported file type: ${file.mimetype}. Only JPEG and PNG formats are allowed.`,
        },]);
      }
      if (file.size > maxBytes) {
        throw new BadRequestPresentationalException([{
            field: `${file.fieldname}`,
            message: `File too large: ${file.originalname}. Maximum allowed size is 5 MB.`,
        },]);
      }
      console.log("size before compression ", file.size );
      const compressedBuffer = await sharp(file.buffer).jpeg({ quality: this.quality }).toBuffer();
      console.log("size after compression ", compressedBuffer.length );

      // Можно заменить буфер у исходного файла
      processedFiles.push({
        ...file,
        buffer: compressedBuffer,
        size: compressedBuffer.length, // новый размер
      });

    }
    return processedFiles;
  }
}
