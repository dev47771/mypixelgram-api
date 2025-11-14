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
}

export const FileSchema = SchemaFactory.createForClass(File);

export type FileDocument = HydratedDocument<File>;
