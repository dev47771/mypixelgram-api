import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../../../core/s3storageAdapter';
import { FilesRepo } from '../../infrastructure/files.repo';
import { ViewOutputFile } from '../../api/dto/viewOutputFile';
import { InputFileUpload } from '../../api/dto/inputPayloadFileDto';
import { BucketFile } from '../../api/dto/bucketFile';
import { FileMongoType } from '../../api/dto/fileMongoType';

@Injectable()
export class FilesUploadUseCase {
  constructor(
    private s3StorageAdapter: S3StorageAdapter,
    private filesRepo: FilesRepo,
  ) {}
  async execute(payload: InputFileUpload): Promise<ViewOutputFile[]> {
    const { userId, files } = payload;
    const filesArray: BucketFile[] = files.map((file: Express.Multer.File) => ({
      originalname: file.originalname,
      buffer: Buffer.from(file.buffer),
      mimetype: file.mimetype,
    }));

    const loadedFiles: FileMongoType[] = await this.s3StorageAdapter.uploadFiles(userId, filesArray);
    try {
      await this.filesRepo.createFiles(loadedFiles);
    } catch (e) {
      console.error(e);
      throw e;
    }

    return loadedFiles.map((file: FileMongoType) => ({
      url: file.url,
      fileId: file.fileId,
    }));
  }
}
