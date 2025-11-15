import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../domain/file.schema';

export class FilesRepo {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async createFiles(files) {
    return (await this.fileModel.insertMany(files)) as FileDocument[];
  }

  async softDeleteFiles(fileIds: string[]) {
    return await this.fileModel.updateMany({ fileId: { $in: fileIds } }, { $set: { deletedAt: new Date() } });
  }
}
