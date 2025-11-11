import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class File {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileId: string;

  @Prop({ required: true })
  createAt: Date;

  @Prop()
  deleteAt?: Date;

  @Prop()
  userId?: string;

  constructor(init?: Partial<File>) {
    if (init) {
      this._id = init._id || crypto.randomUUID(); // или оставить для ObjectId
      this.url = init.url!;
      this.type = init.type!;
      this.originalName = init.originalName!;
      this.fileId = init.fileId!;
      this.createAt = init.createAt || new Date();
      this.deleteAt = init.deleteAt;
      this.userId = init.userId;
    }
  }
}

export const FileSchema = SchemaFactory.createForClass(File);

export type FileDocument = HydratedDocument<File>;