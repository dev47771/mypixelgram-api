import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FilesUploadUseCase } from '../application/use-cases/files-upload.use-case';
import { PayloadTypeDto } from '../../files/api/dto/payloadTypeDto';
import { FileType } from '../domain/file.schema';
import { CheckFileIdOwnerUseCase } from '../application/use-cases/check-fileId-owner.use-case';
import { ValidFileIdDto } from './dto/inputPayloadFileDto';
import { DeleteFilePostUseCase } from '../application/use-cases/delete-post.use-case';
import { GetFilesUseCase } from '../application/use-cases/getFiles.use-case';

@Controller()
export class FilesApiController {
  constructor(
    private filesUploadUseCase: FilesUploadUseCase,
    private checkIsUserOwner: CheckFileIdOwnerUseCase,
    private deleteFilePostUseCase: DeleteFilePostUseCase,
    private getFilesUseCase: GetFilesUseCase,
  ) {}

  @MessagePattern({ cmd: 'filesUpload' })
  async uploadFile(payload: PayloadTypeDto) {
    if (!payload.type || !Object.values(FileType).includes(payload.type)) {
      throw Error(`Invalid file type. Allowed types: ${Object.values(FileType).join(', ')}`);
    }
    return await this.filesUploadUseCase.execute(payload);
  }

  @MessagePattern({ cmd: 'deleteFiles' })
  async deleteFiles(fileIds: string[]) {
    return await this.deleteFilePostUseCase.execute(fileIds);
  }

  @MessagePattern({ cmd: 'checkFileOwner' })
  async handleFileOwnershipCheck(payload: ValidFileIdDto) {
    return await this.checkIsUserOwner.execute(payload);
  }

  @MessagePattern({ cmd: 'getFiles' })
  async getFiles(arrayFilesId: string[]) {
    console.log(arrayFilesId, 'arrayFilesIdooooooooooooooo', arrayFilesId.length);
    return await this.getFilesUseCase.execute(arrayFilesId);
  }
}
