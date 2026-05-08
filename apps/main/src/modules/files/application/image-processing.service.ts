import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { IMAGE_COMPRESSION_SETTINGS, IMAGE_MIME_TYPES } from '../domain/file-upload.constants';

@Injectable()
export class ImageProcessingService {
  async compress(buffer: Buffer, mimetype: string): Promise<Buffer> {
    try {
      switch (mimetype) {
        case IMAGE_MIME_TYPES.JPEG:
          return await sharp(buffer).jpeg(IMAGE_COMPRESSION_SETTINGS.JPEG).toBuffer();
        case IMAGE_MIME_TYPES.PNG:
          return await sharp(buffer).png(IMAGE_COMPRESSION_SETTINGS.PNG).toBuffer();
        default:
          throw new Error(`Unsupported file type: ${mimetype}. Only JPEG and PNG formats are allowed.`);
      }
    } catch (err) {
      throw new Error(`Image processing failed: ${err.message}`);
    }
  }
}
