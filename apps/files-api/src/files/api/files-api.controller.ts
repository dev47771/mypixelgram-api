import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FilesUploadUseCase } from '../application/use-cases/files-upload.use-case';
import { DeleteFilesUseCase } from '../application/use-cases/delete-file.use-case';

@Controller()
export class FilesApiController {
  constructor(
    private filesUploadUseCase: FilesUploadUseCase,
    private deleteFilesUseCase: DeleteFilesUseCase,
  ) {}

  @MessagePattern({ cmd: 'filesUpload' })
  async uploadFile(payload: any) {
    return await this.filesUploadUseCase.execute(payload);
  }

  @MessagePattern({ cmd: 'deleteFiles' })
  async deleteFiles(payload: string[]) {
    return await this.deleteFilesUseCase.execute(payload);
  }
}
