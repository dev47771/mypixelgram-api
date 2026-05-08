import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../../../core/s3storageAdapter';
import { FilesRepo } from '../../infrastructure/files.repo';
import { FileDocument } from '../../domain/file.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CleanSoftDeletedFilesUseCase {
  constructor(
    private filesRepo: FilesRepo,
    private s3StorageAdapter: S3StorageAdapter,
  ) {}

  async execute(): Promise<{
    cleanCount: number;
    successful: string[];
    failed: string[];
  }> {
    try {
      const softDeletedFiles: FileDocument[] = await this.filesRepo.findSoftDeletedFiles();

      if (softDeletedFiles.length === 0) {
        return { cleanCount: 0, successful: [], failed: [] };
      }
      const cleanResults = {
        successful: [] as string[],
        failed: [] as string[],
      };

      for (const file of softDeletedFiles) {
        try {
          await this.s3StorageAdapter.deleteFile(file.key);
          await this.filesRepo.hardDeleteFiles([file.fileId]);
          cleanResults.successful.push(file.fileId);
        } catch (error) {
          cleanResults.failed.push(file.fileId);
        }
      }

      return {
        cleanCount: cleanResults.successful.length,
        successful: cleanResults.successful,
        failed: cleanResults.failed,
      };
    } catch (error) {
      console.error(error);
      throw new RpcException('SoftDeletedFiles failed');
    }
  }
}
