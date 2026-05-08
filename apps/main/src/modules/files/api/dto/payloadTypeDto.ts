import { FileType } from './typeFile.enum';

export class PayloadTypeDto {
  userId: string;
  files: Express.Multer.File[];
  type: FileType;
}
