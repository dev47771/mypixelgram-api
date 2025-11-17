import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from '../domain/file.schema';
import { FileMongoType } from '../api/dto/fileMongoType';

export class FilesRepo {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async createFiles(files: FileMongoType[]) {
    return (await this.fileModel.insertMany(files)) as FileDocument[];
  }

  async softDeleteFiles(fileIds: string[]) {
    return await this.fileModel.updateMany({ fileId: { $in: fileIds } }, { $set: { deletedAt: new Date() } });
  }
}
