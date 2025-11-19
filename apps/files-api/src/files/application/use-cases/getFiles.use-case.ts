import { Injectable } from '@nestjs/common';
import { FilesRepo } from '../../infrastructure/files.repo';
import { RpcException } from '@nestjs/microservices';
import { FileDocument } from '../../domain/file.schema';

@Injectable()
export class GetFilesUseCase {
  constructor(private filesRepo: FilesRepo) {}
  async execute(filesId: string[]) {
    const result: FileDocument[] = await this.filesRepo.findFilesByFilesIds(filesId);

    if (!result) {
      throw new RpcException('Unable to delete files from the database');
    }
    return result;
  }
}
