export class InputFileUpload {
  userId: string;
  files: Express.Multer.File[];
}
export class ValidFileIdDto {
  filesId: string[];
  userId: string;
}
