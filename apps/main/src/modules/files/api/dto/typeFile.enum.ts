export enum FileType {
  POST = 'post',
  AVATAR = 'avatar',
}

export class InputFileType {
  type: FileType;
}
export class UploadedFileInfo {
  url: string;
  fileId: string;
}

export class UploadFilesResponse {
  data: UploadedFileInfo[];
}
