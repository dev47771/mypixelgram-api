import { FileType } from '../../domain/file.schema';

export class PayloadTypeDto {
  userId: string;
  files: Express.Multer.File[];
  type: FileType;
}
