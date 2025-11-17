import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../domain/file.schema';
import { ValidFileIdDto } from '../api/dto/inputPayloadFileDto';

export class FilesRepo {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async createFiles(files) {
    return (await this.fileModel.insertMany(files)) as FileDocument[];
  }

  async softDeleteFiles(fileIds: string[]) {
    return await this.fileModel.updateMany({ fileId: { $in: fileIds } }, { $set: { deletedAt: new Date() } });
  }
  async validateFilesOwnership(dto: ValidFileIdDto): Promise<boolean> {
    const { filesId, userId } = dto;
    const count = await this.fileModel.countDocuments({
      fileId: { $in: filesId },
      userId: userId,
      deleteAt: null,
    });
    return count === filesId.length;
  }
}
