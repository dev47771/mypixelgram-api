import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../../../core/s3storageAdapter';
import { FilesRepo } from '../../infrastructure/files.repo';
import { ViewOutputFile } from '../../api/dto/viewOutputFile';
import { BucketFile } from '../../api/dto/bucketFile';
import { FileMongoType } from '../../api/dto/fileMongoType';
import { PayloadTypeDto } from '../../api/dto/payloadTypeDto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class FilesUploadUseCase {
  constructor(
    private s3StorageAdapter: S3StorageAdapter,
    private filesRepo: FilesRepo,
  ) {}
  async execute(payload: PayloadTypeDto): Promise<ViewOutputFile[]> {
    const { userId, files, type } = payload;
    try {
      const filesArray: BucketFile[] = files.map((file: Express.Multer.File) => ({
        originalname: file.originalname,
        buffer: Buffer.from(file.buffer),
        mimetype: file.mimetype,
      }));

      const loadedFiles: FileMongoType[] = await this.s3StorageAdapter.uploadFiles(userId, filesArray, type);
      await this.filesRepo.createFiles(loadedFiles);

      return loadedFiles.map((file: FileMongoType) => ({
        url: file.url,
        fileId: file.fileId,
      }));
    } catch (e) {
      console.error('Error details:', {
        error: e,
        payload,
        files,
        userId,
        type,
      });
      throw new RpcException('Files Upload Failed, details:' + e.message);
    }
  }
}
