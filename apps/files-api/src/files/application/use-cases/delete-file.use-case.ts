import { HttpException, Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../../../core/s3storageAdapter';
import { FilesRepo } from '../../infrastructure/files.repo';

@Injectable()
export class DeleteFilesUseCase {
  constructor(private filesRepo: FilesRepo) {}
  async execute(filesId: string[]) {
    const resultDeleted = await this.filesRepo.softDeleteFiles(filesId);
    if (!resultDeleted.acknowledged) {
      throw Error('Unable to delete files from the database');
    }
    return resultDeleted;
  }
}
