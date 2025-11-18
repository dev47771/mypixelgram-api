import { Injectable } from '@nestjs/common';
import { FilesRepo } from '../../infrastructure/files.repo';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DeleteFilePostUseCase {
  constructor(private filesRepo: FilesRepo) {}
  async execute(filesId: string[]) {
    const resultDeleted = await this.filesRepo.softDeleteFiles(filesId);
    if (!resultDeleted.acknowledged) {
      throw new RpcException('Unable to delete files from the database');
    }
    return resultDeleted.acknowledged;
  }
}
