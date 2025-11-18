import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../domain/file.schema';
import { FileMongoType } from '../api/dto/fileMongoType';
import { ValidFileIdDto } from '../api/dto/inputPayloadFileDto';

export class FilesRepo {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async createFiles(files: FileMongoType[]) {
    return (await this.fileModel.insertMany(files)) as FileDocument[];
  }

  async softDeleteFiles(fileIds: string[]) {
    return this.fileModel.updateMany({ fileId: { $in: fileIds } }, { $set: { deletedAt: new Date() } });
  }

  async findSoftDeletedFiles(): Promise<FileDocument[]> {
    return this.fileModel.find({
      deletedAt: { $ne: null },
    });
  }

  async hardDeleteFiles(fileIds: string[]) {
    return this.fileModel.deleteMany({
      fileId: { $in: fileIds },
    });
  }

  async getFilesByIds(fileIds: string[]): Promise<FileDocument[]> {
    return this.fileModel.find({
      fileId: { $in: fileIds },
    });
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
