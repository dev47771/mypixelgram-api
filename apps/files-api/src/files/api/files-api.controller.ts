import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FilesUploadUseCase } from '../application/use-cases/files-upload.use-case';
import { DeleteFilesUseCase } from '../application/use-cases/delete-file.use-case';
import { PayloadTypeDto } from '../../files/api/dto/payloadTypeDto';
import { FileType } from '../domain/file.schema';

@Controller()
export class FilesApiController {
  constructor(
    private filesUploadUseCase: FilesUploadUseCase,
    private deleteFilesUseCase: DeleteFilesUseCase,
  ) {}

  @MessagePattern({ cmd: 'filesUpload' })
  async uploadFile(payload: PayloadTypeDto) {
    if (!payload.type || !Object.values(FileType).includes(payload.type)) {
      throw Error(`Invalid file type. Allowed types: ${Object.values(FileType).join(', ')}`);
    }
    return await this.filesUploadUseCase.execute(payload);
  }

  @MessagePattern({ cmd: 'deleteFiles' })
  async deleteFiles(payload: string[]) {
    return await this.deleteFilesUseCase.execute(payload);
  }
}
