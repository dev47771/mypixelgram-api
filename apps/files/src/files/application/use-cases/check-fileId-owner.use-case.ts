import { Injectable } from '@nestjs/common';
import { FilesRepo } from '../../infrastructure/files.repo';
import { ValidFileIdDto } from '../../api/dto/inputPayloadFileDto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CheckFileIdOwnerUseCase {
  constructor(private filesRepo: FilesRepo) {}
  async execute(payload: ValidFileIdDto) {
    const isValid = await this.filesRepo.validateFilesOwnership(payload);
    if (!isValid) {
      throw new RpcException('Some files are not found or do not belong to this user!');
    }
    return isValid;
  }
}
